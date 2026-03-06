<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Toyota Corolla',
                'Honda Civic',
                'BMW 320i',
                'Mercedes-Benz C200',
                'Audi A4',
                'Volkswagen Golf',
                'Hyundai Elantra',
                'Kia Optima',
                'Tesla Model 3',
                'Ford Focus',
                'Chevrolet Malibu',
                'Mazda 3',
                'Nissan Altima',
                'Volvo S60',
                'Peugeot 508',
                'Skoda Octavia',
                'Jaguar XE',
                'Subaru Impreza',
                'Lexus IS300',
                'Genesis G70',
            ]),
            'plate_number' => strtoupper($this->faker->bothify('##??###')), 
            'type' => $this->faker->randomElement(['sedan', 'SUV', 'hatchback', 'coupe', 'pickup']),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}
