<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class VehicleRequest extends Model
{
    protected $table = 'vehicle_requests';

    protected $fillable = [
        'user_id',
        'approver_id',
        'vehicle_id',
        'driver_id',
        'start_at',
        'end_at',
        'status',
        'comment',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'companions' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getDurationInHoursAttribute(): int
    {
        return $this->start_at->diffInHours($this->end_at);
    }

    /**
     * End of the "busy" window: trip end plus 30 minutes (fleet scheduling).
     */
    public function schedulingBusyEnd(): Carbon
    {
        return $this->end_at->copy()->addMinutes(30);
    }

    /**
     * Whether this request's busy window overlaps another fully approved assignment.
     */
    public function schedulingOverlaps(VehicleRequest $other): bool
    {
        if ($other->status !== 'approved') {
            return false;
        }
        if ($this->id === $other->id) {
            return false;
        }
        $a0 = $this->start_at;
        $a1 = $this->schedulingBusyEnd();
        $b0 = $other->start_at;
        $b1 = $other->schedulingBusyEnd();

        return $a0->lte($b1) && $b0->lte($a1);
    }

    /**
     * Approved requests occupying each driver/vehicle at $at (inside [start_at, end_at + 30 min]).
     *
     * @return array{drivers: array<int, VehicleRequest>, vehicles: array<int, VehicleRequest>}
     */
    public static function currentSchedulingAssignmentMaps(?Carbon $at = null): array
    {
        $at ??= now();

        $candidates = static::query()
            ->where('status', 'approved')
            ->whereNotNull('vehicle_id')
            ->whereNotNull('driver_id')
            ->where('start_at', '<=', $at)
            ->where('end_at', '>=', $at->copy()->subMinutes(30))
            ->get();

        $byDriver = [];
        $byVehicle = [];
        foreach ($candidates as $req) {
            if ($at->lt($req->start_at) || $at->gt($req->schedulingBusyEnd())) {
                continue;
            }
            if ($req->driver_id !== null && ! isset($byDriver[$req->driver_id])) {
                $byDriver[$req->driver_id] = $req;
            }
            if ($req->vehicle_id !== null && ! isset($byVehicle[$req->vehicle_id])) {
                $byVehicle[$req->vehicle_id] = $req;
            }
        }

        return ['drivers' => $byDriver, 'vehicles' => $byVehicle];
    }

    public static function assertDriverNotSchedulingBusy(int $driverId, ?Carbon $at = null): void
    {
        $maps = static::currentSchedulingAssignmentMaps($at);
        if (isset($maps['drivers'][$driverId])) {
            throw ValidationException::withMessages([
                'driver' => ['This driver is on an active trip (including the post-trip buffer) and cannot be edited or deactivated.'],
            ]);
        }
    }

    public static function assertVehicleNotSchedulingBusy(int $vehicleId, ?Carbon $at = null): void
    {
        $maps = static::currentSchedulingAssignmentMaps($at);
        if (isset($maps['vehicles'][$vehicleId])) {
            throw ValidationException::withMessages([
                'vehicle' => ['This vehicle is on an active trip (including the post-trip buffer) and cannot be edited or deactivated.'],
            ]);
        }
    }

    public function assertResourcesAvailableForAssignment(int $vehicleId, int $driverId): void
    {
        $candidates = static::query()
            ->where('status', 'approved')
            ->where('id', '!=', $this->id)
            ->where(function ($q) use ($vehicleId, $driverId) {
                $q->where('vehicle_id', $vehicleId)
                    ->orWhere('driver_id', $driverId);
            })
            ->get();

        foreach ($candidates as $other) {
            if (! $this->schedulingOverlaps($other)) {
                continue;
            }
            if ((int) $other->vehicle_id === $vehicleId) {
                throw ValidationException::withMessages([
                    'vehicle_id' => ['This vehicle is already assigned for an overlapping time window.'],
                ]);
            }
            if ((int) $other->driver_id === $driverId) {
                throw ValidationException::withMessages([
                    'driver_id' => ['This driver is already assigned for an overlapping time window.'],
                ]);
            }
        }
    }
}
