<?php
declare(strict_types=1);

namespace TouchBase;

use TouchBase\Http\Request;
use TouchBase\Http\Response;

/**
 * Simple but powerful routing system
 * Supports dynamic path parameters and RESTful verbs
 */
final class Router
{
    private string $basePath;
    private array $routes = [];

    /**
     * @param string $basePath Base path prefix (e.g., '/pelota')
     */
    public function __construct(string $basePath = '/')
    {
        $this->basePath = rtrim($basePath, '/');
    }

    /**
     * Register GET route
     *
     * @param string $path Route path (supports {param} placeholders)
     * @param callable|array $handler Route handler
     */
    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    /**
     * Register POST route
     *
     * @param string $path Route path
     * @param callable|array $handler Route handler
     */
    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    /**
     * Register PUT route
     *
     * @param string $path Route path
     * @param callable|array $handler Route handler
     */
    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    /**
     * Register DELETE route
     *
     * @param string $path Route path
     * @param callable|array $handler Route handler
     */
    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    /**
     * Add route to registry
     *
     * @param string $method HTTP method
     * @param string $path Route path
     * @param callable|array $handler Route handler
     */
    private function addRoute(string $method, string $path, callable|array $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $this->basePath . $path,
            'handler' => $handler,
        ];
    }

    /**
     * Dispatch request to matching route
     *
     * @param Request $request HTTP request
     * @return Response HTTP response
     */
    public function dispatch(Request $request): Response
    {
        foreach ($this->routes as $route) {
            // Convert path with {param} to regex pattern
            $pattern = '#^' . preg_replace(
                '#\{(\w+)\}#',
                '(?P<$1>[^/]+)',
                $route['path']
            ) . '$#';

            // Check if method and path match
            if (
                $route['method'] === $request->method
                && preg_match($pattern, $request->path, $matches)
            ) {
                // Extract named parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                return $this->callHandler($route['handler'], $request, $params);
            }
        }

        // No route matched
        return Response::error(__('error.route_not_found'), 404);
    }

    /**
     * Call route handler with dependency injection
     *
     * @param callable|array $handler Route handler
     * @param Request $request HTTP request
     * @param array<string, string> $params Route parameters
     * @return Response
     */
    private function callHandler(
        callable|array $handler,
        Request $request,
        array $params
    ): Response {
        // Handle [ClassName::class, 'methodName'] format
        if (is_array($handler)) {
            [$class, $method] = $handler;
            $instance = new $class();
            $result = $instance->$method($request, $params);
        } else {
            // Handle closure or callable
            $result = $handler($request, $params);
        }

        // Ensure we always return a Response
        return $result instanceof Response
            ? $result
            : new Response((string) $result);
    }
}
