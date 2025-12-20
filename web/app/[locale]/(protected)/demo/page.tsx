'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Avatar, AvatarGroup, DropdownMenu, useToast } from '@/components/ui';
import { useTranslations } from 'next-intl';

interface Student {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  gradeLevel: number;
  sportInterests: string[];
  learningStyle: string;
  moduleProgress: number;
  badgeCount: number;
  joiningDate: string;
}

export default function DemoPage() {
  const t = useTranslations('common');
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/test-data/students.json')
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load test data:', err);
        addToast('Failed to load student data', 'error');
        setLoading(false);
      });
  }, [addToast]);

  const handleStudentAction = (studentName: string, action: string) => {
    addToast(`${action}: ${studentName}`, 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-tb-navy">Loading demo data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-tb-navy">
              UI Components Demo
            </h1>
            <p className="text-tb-shadow mt-2">
              Testing Avatar, Toast, and DropdownMenu components
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addToast('Info notification', 'info')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Info Toast
            </button>
            <button
              onClick={() => addToast('Success notification!', 'success')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Success Toast
            </button>
            <button
              onClick={() => addToast('Warning notification', 'warning')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Warning Toast
            </button>
            <button
              onClick={() => addToast('Error notification!', 'error')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Error Toast
            </button>
          </div>
        </div>

        {/* Avatar Group Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar Group Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-tb-shadow mb-3">All students (max 6 shown):</p>
                <AvatarGroup
                  max={6}
                  size="md"
                  avatars={students.map(s => ({
                    src: s.avatar,
                    alt: s.fullName,
                  }))}
                />
              </div>
              <div>
                <p className="text-sm text-tb-shadow mb-3">Size variants:</p>
                <div className="flex items-center gap-4">
                  <Avatar src={students[0]?.avatar} alt="XS" size="xs" />
                  <Avatar src={students[1]?.avatar} alt="SM" size="sm" />
                  <Avatar src={students[2]?.avatar} alt="MD" size="md" />
                  <Avatar src={students[3]?.avatar} alt="LG" size="lg" />
                  <Avatar src={students[4]?.avatar} alt="XL" size="xl" />
                  <Avatar src={students[5]?.avatar} alt="2XL" size="2xl" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Cards with DropdownMenu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.slice(0, 9).map(student => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.avatar}
                      alt={student.fullName}
                      size="lg"
                    />
                    <div>
                      <CardTitle className="text-lg">{student.fullName}</CardTitle>
                      <p className="text-sm text-tb-shadow">Grade {student.gradeLevel}</p>
                    </div>
                  </div>
                  <DropdownMenu
                    trigger={
                      <button className="p-2 hover:bg-tb-bone rounded-lg transition-colors">
                        <svg
                          className="w-5 h-5 text-tb-navy"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    }
                    items={[
                      {
                        label: 'View Profile',
                        onClick: () => handleStudentAction(student.fullName, 'View Profile'),
                      },
                      {
                        label: 'Send Message',
                        onClick: () => handleStudentAction(student.fullName, 'Send Message'),
                      },
                      {
                        label: 'View Progress',
                        onClick: () => handleStudentAction(student.fullName, 'View Progress'),
                        divider: true,
                      },
                      {
                        label: 'Remove from Class',
                        onClick: () => handleStudentAction(student.fullName, 'Remove'),
                        variant: 'danger',
                      },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-tb-shadow">Email</p>
                    <p className="text-sm text-tb-navy">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-tb-shadow">Learning Style</p>
                    <p className="text-sm text-tb-navy capitalize">{student.learningStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-tb-shadow mb-1">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-tb-rust h-2 rounded-full transition-all"
                        style={{ width: `${student.moduleProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-tb-shadow mt-1">{student.moduleProgress}%</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-tb-line">
                    <span className="text-sm text-tb-shadow">
                      🏆 {student.badgeCount} badges
                    </span>
                    <span className="text-sm text-tb-shadow">
                      ⚾ {student.sportInterests[0]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
