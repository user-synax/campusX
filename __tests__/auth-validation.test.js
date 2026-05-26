import { signupSchema, loginSchema } from '../utils/schemas';

describe('Auth Validation Schemas', () => {
  describe('Signup Schema', () => {
    const validSignupData = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      gender: 'male',
      otp: '123456'
    };

    it('should validate a correct signup request', () => {
      const result = signupSchema.safeParse(validSignupData);
      expect(result.success).toBe(true);
    });

    it('should fail if passwords do not match', () => {
      const result = signupSchema.safeParse({
        ...validSignupData,
        confirmPassword: 'MismatchPassword123!'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Passwords don't match");
      }
    });

    it('should fail for weak passwords', () => {
      const weakPasswords = [
        'short',           // too short
        'password123!',    // no uppercase
        'PASSWORD123!',    // no lowercase
        'Password!',       // no number
        'Password123'      // no special char
      ];

      weakPasswords.forEach(pw => {
        const result = signupSchema.safeParse({
          ...validSignupData,
          password: pw,
          confirmPassword: pw
        });
        expect(result.success).toBe(false);
      });
    });

    it('should fail for disposable emails', () => {
      const result = signupSchema.safeParse({
        ...validSignupData,
        email: 'test@yopmail.com'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Disposable email addresses are not allowed");
      }
    });

    it('should fail for short email prefix', () => {
      const result = signupSchema.safeParse({
        ...validSignupData,
        email: 'abc@example.com'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Email prefix must be at least 4 characters long");
      }
    });

    it('should fail for invalid phone numbers', () => {
      const result = signupSchema.safeParse({
        ...validSignupData,
        phone: 'invalid-phone'
      });
      expect(result.success).toBe(false);
    });

    it('should pass for valid phone numbers', () => {
      const result = signupSchema.safeParse({
        ...validSignupData,
        phone: '+919876543210'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Login Schema', () => {
    it('should validate a correct login request', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'Password123!'
      });
      expect(result.success).toBe(true);
    });

    it('should fail for empty fields', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: ''
      });
      expect(result.success).toBe(false);
    });

    it('should fail for invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'Password123!'
      });
      expect(result.success).toBe(false);
    });
  });
});
