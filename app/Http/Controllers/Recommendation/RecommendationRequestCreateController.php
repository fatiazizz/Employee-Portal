<?php

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RecommendationRequest;
use Carbon\Carbon;

class RecommendationRequestCreateController extends Controller
{
    public function store(Request $request)
    {
               $user = $request->user();

        $validated = $request->validate([
            'to' => ['required', 'string', 'max:255'],
        ]);

        $recommendation = RecommendationRequest::create([
            'user_id'     => $user->id,
            'approver_id' => $user->manager_id,
            'to'          => $validated['to'],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Recommendation letter request submitted successfully.',
            'data' => $recommendation,
        ]);
    }
}
