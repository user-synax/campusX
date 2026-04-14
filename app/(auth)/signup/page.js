'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    college: '',
    course: '',
    year: '1',
    gender: '',
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleYearChange = (value) => {
    setFormData({ ...formData, year: value });
  };

  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (step === 1) {
        if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.gender) {
          throw new Error('Please fill in all required fields.');
        }

        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            username: formData.username, 
            purpose: 'signup' 
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to send OTP');
        
        setStep(2);
      } else {
        if (!otp || otp.length !== 6) {
          throw new Error('Please enter the 6-digit OTP code.');
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, otp }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Something went wrong');

        window.location.href = '/feed';
      }
    } catch (err) {
      // Zod validation errors might come in an array
      if (err.message === 'Validation failed' && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.message).join(', '));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, purpose: 'signup' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to resend OTP');
      // Optional: show a toast success here
      setError('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">

        <div className="flex flex-col items-center">
          <Logo size="lg" href="/signup" />
          <p className="text-muted-foreground mt-2 text-sm">Join your campus community today</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Input id="college" name="college" value={formData.college} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input id="course" name="course" value={formData.course} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">I am a...</Label>
                    <Select onValueChange={handleGenderChange} value={formData.gender}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Select onValueChange={handleYearChange} defaultValue={formData.year}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="5">5th Year</SelectItem>
                        <SelectItem value="6">Postgraduate/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {error && (
                  <Alert variant={error.includes('sent to your email') ? "default" : "destructive"} className={error.includes('sent to your email') ? "border-primary/50 text-primary" : ""}>
                    <AlertTitle>{error.includes('sent to your email') ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? 'Sending code...' : 'Continue to Verification'}
                </Button>

                <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-4 px-4">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline underline-offset-2">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline underline-offset-2">Privacy Policy</Link>.
                </p>
              </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2 pb-2">
                  <h3 className="font-semibold text-lg">Verify your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to <strong>{formData.email}</strong>. Entering it below will finalize your account creation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-center block">One-Time Password (OTP)</Label>
                    <Input 
                      id="otp" 
                      name="otp" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••" 
                      className="text-center text-2xl tracking-widest h-14"
                      autoComplete="one-time-code"
                      required 
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant={error.includes('sent to your email') ? "default" : "destructive"} className={error.includes('sent to your email') ? "border-primary/50 bg-primary/10 text-primary" : ""}>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full rounded-full h-12" disabled={loading || otp.length !== 6}>
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full rounded-full" 
                      disabled={loading}
                      onClick={handleResendOtp}
                    >
                      Resend Code
                    </Button>
                  </div>

                  <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-4 px-4">
                    By verifying, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline underline-offset-2">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline underline-offset-2">Privacy Policy</Link>.
                  </p>
                </form>

                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setError(null); setOtp(''); }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to edit details
                  </button>
                </div>
              </div>
            )}
            
            {step === 1 && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
