'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Alert } from '@/components/ui';
import Image from 'next/image';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      // Load profile from touchbase_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('touchbase_profiles')
        .select('full_name, email, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile({
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: profileData?.phone || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
      });

      if (profileData?.avatar_url) {
        setPhotoPreview(profileData.avatar_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      let avatarUrl = profile.avatar_url;

      // Upload photo if changed
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('folder', 'avatars');

        const uploadRes = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const { error } = await uploadRes.json();
          throw new Error(error || 'Failed to upload image');
        }

        const { url } = await uploadRes.json();
        avatarUrl = url;
      }

      // Update profile in touchbase_profiles
      const { error: updateError } = await supabase
        .from('touchbase_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: avatarUrl,
        }, {
          onConflict: 'id',
        });

      if (updateError) {
        throw updateError;
      }

      // Update auth user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          avatar_url: avatarUrl,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      setSuccess(true);
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-tb-navy]"></div>
          <p className="mt-4 text-sm font-sans text-[--color-tb-shadow]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('editProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('photo')}
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full object-cover w-24 h-24"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No photo</span>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="text-sm"
                  />
                  <p className="text-xs text-[--color-tb-shadow] mt-1">
                    {t('photoHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('fullName')}
              </label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-[--color-tb-shadow] mt-1">
                {t('emailHint')}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('phone')}
              </label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            {success && (
              <Alert variant="success">{t('saveSuccess')}</Alert>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

