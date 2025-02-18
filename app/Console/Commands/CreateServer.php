<?php

namespace App\Console\Commands;

use App\Models\Server;
use Illuminate\Console\Command;

class CreateServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-server';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create Server';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $server = Server::create([
            'key' => \Illuminate\Support\Str::random(),
            'name' => 'Server',
            'address' => null,
        ]);

        $this->table(
            ['Name', 'Address', 'Key', 'UUID'],
            [
                [
                    $server->name,
                    $server->address,
                    $server->key,
                    $server->id,
                ]
            ]
        );
    }
}
