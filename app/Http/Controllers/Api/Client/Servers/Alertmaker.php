<?php

namespace App\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class AlertController extends ClientApiController
{
    /**
     * Get the current alert for a server.
     *
     * @param Server $server
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAlert(Server $server)
    {
        // Assuming 'alert' is a field in the 'servers' table that stores alert information
        return response()->json([
            'alert' => $server->alert,
        ], Response::HTTP_OK);
    }

    /**
     * Set an alert for the server.
     *
     * @param \Illuminate\Http\Request $request
     * @param Server $server
     * @return \Illuminate\Http\JsonResponse
     */
    public function setAlert(Request $request, Server $server)
    {
        // Validate the request input
        $request->validate([
            'alert' => 'required|string|max:255',  // Modify validation as needed
        ]);

        // Update the server's alert
        $server->alert = $request->input('alert');
        $server->save();

        // Log activity (optional)
        // Activity::event('server:alert.set')->property('alert', $request->input('alert'))->log();

        return response()->json([
            'message' => 'Alert updated successfully.',
            'alert' => $server->alert,
        ], Response::HTTP_OK);
    }
}
