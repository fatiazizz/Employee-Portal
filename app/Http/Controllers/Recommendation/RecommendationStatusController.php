<?php 

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\RecommendationRequest;

class RecommendationStatusController extends Controller
{
    public function update($id, Request $request)
    {
        $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $recommendation = RecommendationRequest::findOrFail($id);
        $recommendation->status = $request->status;
        $recommendation->save();

        return redirect()->back()->with('success', 'Recommendation status updated.');
    }
}
