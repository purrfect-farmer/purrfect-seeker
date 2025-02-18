<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Server::all();
    }


    /**
     * Get a server
     */
    public function show(Server $server)
    {
        return $server;
    }

    /**
     * Update a server.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'size:16', Rule::exists(Server::class, 'key')],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'url', 'max:255'],
        ]);

        echo $data['key'];

        /** Update Server */
        Server::where(['key' => $data['key']])->update([
            'name' => $data['name'],
            'address' => $data['address'],
        ]);

        return response()->noContent();
    }
}
