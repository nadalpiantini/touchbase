<?php

namespace TouchBase\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TouchBase\Router;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

class RouterTest extends TestCase
{
    private Router $router;

    protected function setUp(): void
    {
        $this->router = new Router('/touchbase');
    }

    public function testBasicRouteRegistration(): void
    {
        // Register a route
        $this->router->get('/test', function() {
            return new Response('Test response');
        });

        // Create a mock request
        $request = $this->createMock(Request::class);
        $request->method = 'GET';
        $request->path = '/touchbase/test';

        // Dispatch
        $response = $this->router->dispatch($request);

        $this->assertInstanceOf(Response::class, $response);
        $this->assertEquals('Test response', $response->body);
    }

    public function testRouteWithParameters(): void
    {
        // Register route with parameter
        $this->router->get('/teams/{id}', function($request, $params) {
            return new Response('Team ' . $params['id']);
        });

        // Mock request
        $request = $this->createMock(Request::class);
        $request->method = 'GET';
        $request->path = '/touchbase/teams/42';

        // Dispatch
        $response = $this->router->dispatch($request);

        $this->assertEquals('Team 42', $response->body);
    }

    public function testMultipleParametersInRoute(): void
    {
        // Register route with multiple parameters
        $this->router->get('/teams/{teamId}/players/{playerId}', function($request, $params) {
            return new Response("Team {$params['teamId']}, Player {$params['playerId']}");
        });

        // Mock request
        $request = $this->createMock(Request::class);
        $request->method = 'GET';
        $request->path = '/touchbase/teams/10/players/5';

        // Dispatch
        $response = $this->router->dispatch($request);

        $this->assertEquals('Team 10, Player 5', $response->body);
    }

    public function testRouteNotFound(): void
    {
        // Mock request for non-existent route
        $request = $this->createMock(Request::class);
        $request->method = 'GET';
        $request->path = '/touchbase/nonexistent';

        // Dispatch
        $response = $this->router->dispatch($request);

        $this->assertEquals(404, $response->statusCode);
    }

    public function testHttpMethodMatching(): void
    {
        // Register same path with different methods
        $this->router->get('/resource', function() {
            return new Response('GET response');
        });
        $this->router->post('/resource', function() {
            return new Response('POST response');
        });

        // Test GET
        $getRequest = $this->createMock(Request::class);
        $getRequest->method = 'GET';
        $getRequest->path = '/touchbase/resource';
        $getResponse = $this->router->dispatch($getRequest);
        $this->assertEquals('GET response', $getResponse->body);

        // Test POST
        $postRequest = $this->createMock(Request::class);
        $postRequest->method = 'POST';
        $postRequest->path = '/touchbase/resource';
        $postResponse = $this->router->dispatch($postRequest);
        $this->assertEquals('POST response', $postResponse->body);
    }

    public function testControllerMethodRouting(): void
    {
        // Register controller method
        $this->router->get('/teams', [TeamControllerStub::class, 'index']);

        // Mock request
        $request = $this->createMock(Request::class);
        $request->method = 'GET';
        $request->path = '/touchbase/teams';

        // Dispatch
        $response = $this->router->dispatch($request);

        $this->assertEquals('Teams list', $response->body);
    }
}

// Test stub for controller
class TeamControllerStub
{
    public function index($request, $params)
    {
        return new Response('Teams list');
    }
}