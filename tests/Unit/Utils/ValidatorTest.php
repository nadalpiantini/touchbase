<?php

namespace TouchBase\Tests\Unit\Utils;

use PHPUnit\Framework\TestCase;
use TouchBase\Utils\Validator;

class ValidatorTest extends TestCase
{
    public function testRequiredValidation(): void
    {
        $validator = new Validator(['name' => 'John']);

        $validator->require('name');
        $this->assertFalse($validator->hasErrors());

        $validator->require('email');
        $this->assertTrue($validator->hasErrors());
        $this->assertArrayHasKey('email', $validator->getErrors());
    }

    public function testEmailValidation(): void
    {
        $validator = new Validator(['email' => 'test@example.com']);
        $validator->email('email');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['email' => 'invalid-email']);
        $validator->email('email');
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('valid email', $validator->getErrors()['email']);
    }

    public function testMinLengthValidation(): void
    {
        $validator = new Validator(['password' => '12345678']);
        $validator->minLength('password', 8);
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['password' => '1234567']);
        $validator->minLength('password', 8);
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('at least 8', $validator->getErrors()['password']);
    }

    public function testMaxLengthValidation(): void
    {
        $validator = new Validator(['username' => 'john']);
        $validator->maxLength('username', 10);
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['username' => 'verylongusername']);
        $validator->maxLength('username', 10);
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('exceed 10', $validator->getErrors()['username']);
    }

    public function testNumericValidation(): void
    {
        $validator = new Validator(['age' => '25']);
        $validator->numeric('age');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['age' => 25]);
        $validator->numeric('age');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['age' => 'twenty-five']);
        $validator->numeric('age');
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('numeric', $validator->getErrors()['age']);
    }

    public function testInValidation(): void
    {
        $validator = new Validator(['status' => 'active']);
        $validator->in('status', ['active', 'inactive', 'pending']);
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['status' => 'deleted']);
        $validator->in('status', ['active', 'inactive', 'pending']);
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('one of:', $validator->getErrors()['status']);
    }

    public function testDateValidation(): void
    {
        $validator = new Validator(['date' => '2024-01-01']);
        $validator->date('date');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['date' => '2024-01-01 10:30:00']);
        $validator->date('date');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['date' => 'not-a-date']);
        $validator->date('date');
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('valid date', $validator->getErrors()['date']);
    }

    public function testPatternValidation(): void
    {
        $validator = new Validator(['phone' => '123-456-7890']);
        $validator->pattern('phone', '/^\d{3}-\d{3}-\d{4}$/');
        $this->assertFalse($validator->hasErrors());

        $validator = new Validator(['phone' => '1234567890']);
        $validator->pattern('phone', '/^\d{3}-\d{3}-\d{4}$/');
        $this->assertTrue($validator->hasErrors());
        $this->assertStringContainsString('match', $validator->getErrors()['phone']);
    }

    public function testChainedValidation(): void
    {
        $validator = new Validator([
            'email' => 'test@example.com',
            'password' => '12345678',
            'age' => '30',
        ]);

        $validator
            ->require('email')
            ->email('email')
            ->require('password')
            ->minLength('password', 8)
            ->require('age')
            ->numeric('age');

        $this->assertFalse($validator->hasErrors());
    }

    public function testMultipleErrorsPerField(): void
    {
        $validator = new Validator(['email' => 'a']);

        $validator
            ->email('email')
            ->minLength('email', 5);

        $this->assertTrue($validator->hasErrors());
        $errors = $validator->getErrors();
        $this->assertArrayHasKey('email', $errors);
        // Should have both email format and length errors
    }
}