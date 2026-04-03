<?php

// database/factories/DriverFactory.php

namespace Database\Factories;

use App\Models\Driver;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverFactory extends Factory
{
    protected $model = Driver::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'license_number' => strtoupper($this->faker->bothify('DRV-#######')),
            'phone' => $this->faker->phoneNumber,
            'is_active' => false,
        ];
    }
}
