<?php

use App\Models\EquipmentBalance;
use App\Models\EquipmentRequest;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('data:clear-product-requests-and-warehouse', function () {
    $this->info('Clearing all equipment (product) requests and warehouse data...');

    DB::transaction(function () {
        $requestsDeleted = EquipmentRequest::query()->delete();
        $balancesDeleted = EquipmentBalance::query()->delete();

        $this->info("Deleted {$requestsDeleted} equipment request(s).");
        $this->info("Deleted {$balancesDeleted} warehouse (equipment balance) record(s).");
    });

    $this->info('Done. No product requests or warehouse data remain.');
})->purpose('Remove all equipment/product requests and all warehouse (equipment_balances) data from the database');
