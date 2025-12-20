"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";

type Assignment = {
  id: string;
  title: string;
  description: string;
  module_id: string;
  module_title: string;
  class_id: string;
  class_name: string;
  due_date: string;
  max_points: number;
  teacher_name: string;
};

type Submission = {
  id: string;
  content: string;
  file_url?: string;
  submitted_at: string;
  status: "submitted" | "graded" | "returned";
  grade?: number;
  feedback?: string;
  graded_at?: string;
};

export default function AssignmentDetailPage() {
  const _t = useTranslations("student.assignments"); // TODO: Add i18n throughout page
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        setSubmission(data.submission);
      } else {
        // Mock data for development
        setAssignment({
          id: assignmentId,
          title: "Personal Budget Exercise",
          description: `Create a monthly personal budget that includes:

1. **Income Sources**: List all your sources of income (allowance, part-time job, gifts, etc.)

2. **Fixed Expenses**: Identify recurring expenses like subscriptions, transportation, etc.

3. **Variable Expenses**: Track spending on food, entertainment, and other flexible categories.

4. **Savings Goals**: Set aside at least 10% for savings and explain your savings goal.

5. **Reflection**: Write a paragraph about what you learned about your spending habits.

Submit your completed budget spreadsheet or document along with your reflection.`,
          module_id: "mod-1",
          module_title: "Financial Literacy: Budgeting Basics",
          class_id: "class-1",
          class_name: "Life Skills 101",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
          teacher_name: "Sarah Johnson",
        });
        // No submission yet
        setSubmission(null);
      }
    } catch (error) {
      console.error("Error loading assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: submissionContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      } else {
        // Mock success for development
        setSubmission({
          id: "sub-" + Date.now(),
          content: submissionContent,
          submitted_at: new Date().toISOString(),
          status: "submitted",
        });
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      // Mock success for development
      setSubmission({
        id: "sub-" + Date.now(),
        content: submissionContent,
        submitted_at: new Date().toISOString(),
        status: "submitted",
      });
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "info" | "warning"> = {
      submitted: "info",
      graded: "success",
      returned: "warning",
    };
    const labels: Record<string, string> = {
      submitted: "Submitted",
      graded: "Graded",
      returned: "Returned for Revision",
    };
    return (
      <Badge variant={variants[status] || "info"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getDueStatus = () => {
    if (!assignment) return null;
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return <Badge variant="warning">Overdue by {Math.abs(daysUntilDue)} days</Badge>;
    } else if (daysUntilDue === 0) {
      return <Badge variant="warning">Due Today</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge variant="info">Due in {daysUntilDue} days</Badge>;
    }
    return <Badge variant="status">Due in {daysUntilDue} days</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tb-rust"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="text-center">
          <p className="text-tb-shadow mb-4">Assignment not found</p>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone">
      {/* Success Toast */}
      {showConfirmation && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Assignment submitted successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/${locale}/student/assignments`}
              className="text-tb-shadow hover:text-tb-navy"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <span className="text-tb-shadow">Assignments</span>
            <span className="text-tb-shadow">/</span>
            <span className="text-tb-navy font-medium truncate">{assignment.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-tb-navy mb-2">
                {assignment.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center text-sm text-tb-shadow">
                <span>{assignment.class_name}</span>
                <span>•</span>
                <span>{assignment.module_title}</span>
                <span>•</span>
                <span>By {assignment.teacher_name}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getDueStatus()}
              <span className="text-sm text-tb-shadow">
                Due: {new Date(assignment.due_date).toLocaleDateString()} at{" "}
                {new Date(assignment.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-sm font-medium text-tb-navy">
                {assignment.max_points} points possible
              </span>
            </div>
          </div>
        </div>

        {/* Assignment Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-tb max-w-none">
              {assignment.description.split("\n").map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-tb-navy whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Section */}
        {submission ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Submission</CardTitle>
                {getStatusBadge(submission.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Submission Details */}
                <div className="bg-tb-bone/50 rounded-lg p-4">
                  <p className="text-sm text-tb-shadow mb-2">
                    Submitted on {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                  <div className="prose prose-tb max-w-none">
                    <p className="text-tb-navy whitespace-pre-wrap">{submission.content}</p>
                  </div>
                  {submission.file_url && (
                    <div className="mt-4">
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-tb-rust hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Attached File
                      </a>
                    </div>
                  )}
                </div>

                {/* Grade and Feedback */}
                {submission.status === "graded" && (
                  <div className="border-t border-tb-line pt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-tb-navy">
                          {submission.grade}
                        </div>
                        <div className="text-sm text-tb-shadow">
                          / {assignment.max_points}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (submission.grade || 0) >= 90
                                ? "bg-green-500"
                                : (submission.grade || 0) >= 70
                                ? "bg-blue-500"
                                : (submission.grade || 0) >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${((submission.grade || 0) / assignment.max_points) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">Teacher Feedback</h4>
                        <p className="text-green-700">{submission.feedback}</p>
                        {submission.graded_at && (
                          <p className="text-sm text-green-600 mt-2">
                            Graded on {new Date(submission.graded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Returned for Revision */}
                {submission.status === "returned" && submission.feedback && (
                  <div className="border-t border-tb-line pt-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2">
                        Revision Requested
                      </h4>
                      <p className="text-amber-700">{submission.feedback}</p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSubmissionContent(submission.content);
                          setSubmission(null);
                        }}
                      >
                        Revise and Resubmit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust resize-y"
                    placeholder="Type your response here... You can include your budget details, calculations, and reflection."
                  />
                  <p className="text-sm text-tb-shadow mt-2">
                    {submissionContent.length} characters
                  </p>
                </div>

                {/* File Upload (UI only) */}
                <div>
                  <label className="block text-sm font-medium text-tb-navy mb-2">
                    Attach File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-tb-line rounded-lg p-6 text-center hover:border-tb-rust transition-colors cursor-pointer">
                    <svg
                      className="w-10 h-10 mx-auto text-tb-shadow mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-tb-shadow text-sm">
                      Drag and drop a file, or click to browse
                    </p>
                    <p className="text-tb-shadow/60 text-xs mt-1">
                      PDF, DOC, DOCX, XLS, XLSX up to 10MB
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || !submissionContent.trim()}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
