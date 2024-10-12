@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <h1>Administrative Overview<small>Astral-Cloud manager!</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Index</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box
            @if($version->isLatestPanel())
                box-success
            @else
                box-danger
            @endif
        ">
            <div class="box-header with-border">
                <h3 class="box-title">System Information</h3>
            </div>
            <div class="box-body">
                @if ($version->isLatestPanel())
                    You are running Kushi theme <code>{{ config('app.fork-version') }}</code> based on Pterodactyl Panel version <code>{{ config('app.version') }}</code>. Your panel is up-to-date!
                @else
                    Your panel is <strong>not up-to-date!</strong> The latest version is <a href="https://github.com/Nookure/NookTheme/releases/v{{ $version->getPanel() }}" target="_blank"><code>{{ $version->getPanel() }}</code></a> and you are currently running version <code>{{ config('app.version') }}</code>.
                @endif
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="{{ $version->getDiscord() }}"><button class="btn btn-warning" style="width:100%;"><i class="fa fa-fw fa-support"></i> Get Help <small>(via Discord)</small></button></a>
    </div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://pterodactyl.io"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-link"></i> Documentation</button></a>
    </div>
    <div class="clearfix visible-xs-block">&nbsp;</div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://github.com/pterodactyl/panel"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-support"></i> Github</button></a>
    </div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="{{ $version->getDonations() }}"><button class="btn btn-success" style="width:100%;"><i class="fa fa-fw fa-money"></i> Support the Project</button></a>
    </div>
</div>

@php
    // Fetch data from APIs
    $messageData = json_decode(file_get_contents('https://image.astralaxis.tech/message'), true);
    $alertData = json_decode(file_get_contents('https://image.astralaxis.tech/alert'), true);
    $serversData = json_decode(file_get_contents(config('app.url') . '/api/application/servers'), true);
    $dashData = json_decode(file_get_contents('https://dashapi.astralaxis.one/'), true);

    $message = $messageData['message'] ?? 'No message available';
    $alert = $alertData['alert'] ?? 'No alert available';
    $serverCount = count($serversData['data'] ?? []);
@endphp

<div class="row" style="margin-top: 20px;">
    <div class="col-md-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">System Messages</h3>
            </div>
            <div class="box-body">
                <p><strong>Message:</strong> {{ $message }}</p>
                <p><strong>Alert:</strong> {{ $alert }}</p>
                <button class="btn btn-default" onclick="changeMessage()">Change Message</button>
                <button class="btn btn-default" onclick="changeAlert()">Change Alert</button>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-info">
            <div class="box-header with-border">
                <h3 class="box-title">Server Information</h3>
            </div>
            <div class="box-body">
                <p><strong>Total Servers:</strong> {{ $serverCount }}</p>
            </div>
        </div>
    </div>
</div>

@if($dashData)
<div class="row">
    <div class="col-md-12">
        <div class="box box-success">
            <div class="box-header with-border">
                <h3 class="box-title">Dashboard Information</h3>
            </div>
            <div class="box-body">
                <p><strong>Uptime:</strong> {{ $dashData['uptime'] }}</p>
                <p><strong>Memory Usage:</strong></p>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: {{ $dashData['memory']['usagePercent'] }}%;" aria-valuenow="{{ $dashData['memory']['usagePercent'] }}" aria-valuemin="0" aria-valuemax="100">{{ number_format($dashData['memory']['usagePercent'], 2) }}%</div>
                </div>
                <p>{{ number_format($dashData['memory']['used'] / 1024 / 1024 / 1024, 2) }} GB / {{ number_format($dashData['memory']['total'] / 1024 / 1024 / 1024, 2) }} GB</p>
                
                <h4>CPU Usage:</h4>
                @foreach($dashData['cpuUsage'] as $index => $cpu)
                    <p><strong>CPU {{ $index + 1 }}:</strong> {{ $cpu['model'] }}</p>
                    <p>User: {{ $cpu['times']['user'] }}, System: {{ $cpu['times']['sys'] }}, Idle: {{ $cpu['times']['idle'] }}</p>
                @endforeach

                <h4>Disk Usage:</h4>
                @foreach($dashData['diskUsage'] as $disk)
                    <p><strong>{{ $disk['fs'] }} ({{ $disk['mount'] }}):</strong></p>
                    <p>Used: {{ number_format($disk['used'] / 1024 / 1024 / 1024, 2) }} GB / {{ number_format($disk['size'] / 1024 / 1024 / 1024, 2) }} GB ({{ $disk['use'] }}%)</p>
                @endforeach

                <h4>Network Stats:</h4>
                @foreach($dashData['networkStats'] as $net)
                    <p><strong>Interface:</strong> {{ $net['iface'] }}</p>
                    <p>RX: {{ number_format($net['rx_bytes'] / 1024 / 1024, 2) }} MB, TX: {{ number_format($net['tx_bytes'] / 1024 / 1024, 2) }} MB</p>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endif

@endsection

@section('footer-scripts')
    @parent
    <script>
        function changeMessage() {
            var newMessage = prompt('Enter new message:');
            if (newMessage) {
                fetch('https://image.astralaxis.tech/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alert: newMessage }),
                }).then(() => location.reload());
            }
        }

        function changeAlert() {
            var newAlert = prompt('Enter new alert:');
            if (newAlert) {
                fetch('https://image.astralaxis.tech/alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alert: newAlert }),
                }).then(() => location.reload());
            }
        }
    </script>
@endsection

@section('custom-css')
<style>
    .progress {
        height: 20px;
        margin-bottom: 20px;
        overflow: hidden;
        background-color: #f5f5f5;
        border-radius: 4px;
        -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
        box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    }
    .progress-bar {
        float: left;
        width: 0%;
        height: 100%;
        font-size: 12px;
        line-height: 20px;
        color: #fff;
        text-align: center;
        background-color: #337ab7;
        -webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
        -webkit-transition: width .6s ease;
        -o-transition: width .6s ease;
        transition: width .6s ease;
    }
</style>
@endsection