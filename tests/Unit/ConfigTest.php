<?php

namespace TouchBase\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TouchBase\Config;

class ConfigTest extends TestCase
{
    protected function setUp(): void
    {
        // Reset $_ENV for testing
        $_ENV = [
            'DB_HOST' => 'localhost',
            'DB_PORT' => '3306',
            'DEBUG' => 'true',
            'APP_ENV' => 'testing',
        ];
    }

    public function testEnvWithExistingKey(): void
    {
        $this->assertEquals('localhost', Config::env('DB_HOST'));
        $this->assertEquals('3306', Config::env('DB_PORT'));
    }

    public function testEnvWithDefaultValue(): void
    {
        $this->assertEquals('default_value', Config::env('NON_EXISTENT_KEY', 'default_value'));
    }

    public function testEnvWithoutDefaultForMissingKey(): void
    {
        $this->assertNull(Config::env('NON_EXISTENT_KEY'));
    }

    public function testGetDatabaseConfig(): void
    {
        $_ENV['DB_DRIVER'] = 'mysql';
        $_ENV['DB_NAME'] = 'touchbase_test';
        $_ENV['DB_USER'] = 'testuser';
        $_ENV['DB_PASS'] = 'testpass';

        $config = Config::getDatabaseConfig();

        $this->assertIsArray($config);
        $this->assertEquals('mysql', $config['driver']);
        $this->assertEquals('localhost', $config['host']);
        $this->assertEquals('3306', $config['port']);
        $this->assertEquals('touchbase_test', $config['database']);
        $this->assertEquals('testuser', $config['username']);
        $this->assertEquals('testpass', $config['password']);
    }

    public function testGetDatabaseConfigWithDefaults(): void
    {
        // Unset all DB env vars to test defaults
        unset($_ENV['DB_DRIVER']);
        unset($_ENV['DB_HOST']);
        unset($_ENV['DB_PORT']);
        unset($_ENV['DB_NAME']);
        unset($_ENV['DB_USER']);
        unset($_ENV['DB_PASS']);

        $config = Config::getDatabaseConfig();

        $this->assertEquals('mysql', $config['driver']);
        $this->assertEquals('localhost', $config['host']);
        $this->assertEquals('3306', $config['port']);
        $this->assertEquals('chamilo', $config['database']);
        $this->assertEquals('root', $config['username']);
        $this->assertEquals('', $config['password']);
    }

    public function testIsDebugTrue(): void
    {
        $_ENV['DEBUG'] = 'true';
        $this->assertTrue(Config::isDebug());

        $_ENV['DEBUG'] = 'TRUE';
        $this->assertTrue(Config::isDebug());

        $_ENV['DEBUG'] = 'True';
        $this->assertTrue(Config::isDebug());
    }

    public function testIsDebugFalse(): void
    {
        $_ENV['DEBUG'] = 'false';
        $this->assertFalse(Config::isDebug());

        $_ENV['DEBUG'] = '0';
        $this->assertFalse(Config::isDebug());

        $_ENV['DEBUG'] = '';
        $this->assertFalse(Config::isDebug());

        unset($_ENV['DEBUG']);
        $this->assertFalse(Config::isDebug());
    }

    public function testGetenv(): void
    {
        // Test that Config::env also checks getenv()
        putenv('TEST_ENV_VAR=test_value');
        $this->assertEquals('test_value', Config::env('TEST_ENV_VAR'));
        putenv('TEST_ENV_VAR'); // Clean up
    }

    protected function tearDown(): void
    {
        // Clean up
        $_ENV = [];
    }
}