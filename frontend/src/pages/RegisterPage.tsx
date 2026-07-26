import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRegister } from '@/hooks/use-auth';

export function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      { name, email, password },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex items-center justify-end gap-2 p-4">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 pb-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
              <Landmark className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t('auth.createAccount')}</h1>
            <p className="text-muted-foreground text-sm">{t('auth.startTracking')}</p>
          </div>

          <Card className="shadow-sm">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-4">
                {register.error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {t('auth.registrationFailed')}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <InputWithIcon
                    id="name"
                    type="text"
                    icon={User}
                    placeholder={t('auth.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <InputWithIcon
                    id="email"
                    type="email"
                    icon={Mail}
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <PasswordInput
                    id="password"
                    placeholder={t('auth.passwordMinLength')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={register.isPending}>
                  {register.isPending ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t('auth.hasAccount')}{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t('auth.signInLink')}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
