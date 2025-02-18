<?php

namespace App\Console\Commands;

use App\Models\Server;
use Illuminate\Console\Command;

class ListServers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:list-servers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List Servers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $servers = Server::all();

        $this->table(
            ['Name', 'Address', 'Key', 'UUID'],
            $servers->map(fn(Server $server) => [
                $server->name,
                $server->address,
                $server->key,
                $server->id,
            ])
        );
    }
}
