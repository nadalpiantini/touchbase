"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from "@/components/ui";

type Assignment = {
  id: string;
  title: string;
  description: string;
  class_name: string;
  module_title: string;
  due_date: string;
  max_points: number;
};

type Submission = {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  content: string;
  file_url?: string;
  submitted_at: string;
  status: "submitted" | "graded" | "returned";
  grade?: number;
  feedback?: string;
  graded_at?: string;
};

export default function AssignmentSubmissionsPage() {
  const t = useTranslations("teacher.assignments");
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const loadSubmissions = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        setSubmissions(data.submissions || []);
      } else {
        // Mock data for development
        setAssignment({
          id: assignmentId,
          title: "Personal Budget Exercise",
          description: "Create a monthly personal budget...",
          class_name: "Life Skills 101",
          module_title: "Financial Literacy: Budgeting Basics",
          due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
        });
        setSubmissions([
          {
            id: "sub-1",
            student_id: "s-1",
            student_name: "Alex Rivera",
            student_email: "alex@touchbase.academy",
            content: `**My Monthly Budget**

Income:
- Part-time job: $400
- Allowance: $100
Total: $500

Fixed Expenses:
- Phone bill: $50
- Streaming: $15
- Gym: $30
Total: $95

Variable Expenses:
- Food/snacks: $100
- Entertainment: $80
- Transportation: $40
Total: $220

Savings: $185 (37%)

**Reflection:**
Creating this budget helped me realize I spend too much on entertainment. I'm going to try to reduce that next month and save more for a new laptop.`,
            submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: "submitted",
          },
          {
            id: "sub-2",
            student_id: "s-2",
            student_name: "Emma Wilson",
            student_email: "emma@touchbase.academy",
            content: `Budget Summary:
- Income: $350/month
- Expenses: $280/month
- Savings: $70/month (20%)

I'm saving for a car and this exercise showed me I can reach my goal in 18 months if I stay consistent.`,
            submitted_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            status: "graded",
            grade: 92,
            feedback: "Great work! Clear organization and realistic goals. Consider adding more detail to your expense categories.",
            graded_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "sub-3",
            student_id: "s-3",
            student_name: "Jordan Chen",
            student_email: "jordan@touchbase.academy",
            content: "My budget is attached as a file.",
            file_url: "/files/budget-jordan.xlsx",
            submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            status: "returned",
            feedback: "Please include your reflection as text, not just the spreadsheet. Resubmit with the written portion.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !gradeInput) return;

    const grade = parseInt(gradeInput);
    if (isNaN(grade) || grade < 0 || grade > (assignment?.max_points || 100)) {
      alert(`Grade must be between 0 and ${assignment?.max_points || 100}`);
      return;
    }

    setGrading(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: selectedSubmission.id,
          grade,
          feedback: feedbackInput,
        }),
      });

      if (res.ok) {
        // Update local state
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === selectedSubmission.id
              ? {
                  ...s,
                  grade,
                  feedback: feedbackInput,
                  status: "graded" as const,
                  graded_at: new Date().toISOString(),
                }
              : s
          )
        );
        setSelectedSubmission(null);
        setGradeInput("");
        setFeedbackInput("");
      } else {
        // Mock success
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === selectedSubmission.id
              ? {
                  ...s,
                  grade,
                  feedback: feedbackInput,
                  status: "graded" as const,
                  graded_at: new Date().toISOString(),
                }
              : s
          )
        );
        setSelectedSubmission(null);
        setGradeInput("");
        setFeedbackInput("");
      }
    } catch (error) {
      console.error("Error grading submission:", error);
    } finally {
      setGrading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedSubmission || !feedbackInput.trim()) {
      alert("Please provide feedback explaining what needs to be revised.");
      return;
    }

    setGrading(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: selectedSubmission.id,
          status: "returned",
          feedback: feedbackInput,
        }),
      });

      if (res.ok || true) {
        // Update local state (mock success)
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === selectedSubmission.id
              ? {
                  ...s,
                  feedback: feedbackInput,
                  status: "returned" as const,
                }
              : s
          )
        );
        setSelectedSubmission(null);
        setGradeInput("");
        setFeedbackInput("");
      }
    } catch (error) {
      console.error("Error returning submission:", error);
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "info" | "warning"> = {
      submitted: "info",
      graded: "success",
      returned: "warning",
    };
    const labels: Record<string, string> = {
      submitted: "Needs Grading",
      graded: "Graded",
      returned: "Returned",
    };
    return (
      <Badge variant={variants[status] || "info"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredSubmissions = submissions.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  );

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    graded: submissions.filter((s) => s.status === "graded").length,
    returned: submissions.filter((s) => s.status === "returned").length,
    avgGrade:
      submissions.filter((s) => s.grade != null).length > 0
        ? Math.round(
            submissions.filter((s) => s.grade != null).reduce((sum, s) => sum + (s.grade || 0), 0) /
              submissions.filter((s) => s.grade != null).length
          )
        : null,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tb-rust"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/teacher/assignments"
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
            <span className="text-tb-navy font-medium truncate">
              {assignment?.title}
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold text-tb-navy mb-2">
            {t("submissions") || "Student Submissions"}
          </h1>
          <div className="flex flex-wrap gap-2 items-center text-sm text-tb-shadow">
            <span>{assignment?.class_name}</span>
            <span>•</span>
            <span>{assignment?.module_title}</span>
            <span>•</span>
            <span>Due: {assignment && new Date(assignment.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">{stats.total}</div>
              <p className="text-sm text-tb-shadow">Total Submissions</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilterStatus("submitted")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
              <p className="text-sm text-tb-shadow">Needs Grading</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilterStatus("graded")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{stats.graded}</div>
              <p className="text-sm text-tb-shadow">Graded</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilterStatus("returned")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600">{stats.returned}</div>
              <p className="text-sm text-tb-shadow">Returned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-tb-navy">
                {stats.avgGrade !== null ? `${stats.avgGrade}%` : "-"}
              </div>
              <p className="text-sm text-tb-shadow">Average Grade</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm text-tb-shadow">Filter:</span>
          <div className="flex gap-2">
            {["all", "submitted", "graded", "returned"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status === "all" ? "All" : status === "submitted" ? "Needs Grading" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Submissions ({filteredSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-tb-line max-h-[600px] overflow-y-auto">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 cursor-pointer hover:bg-tb-bone/50 transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? "bg-tb-rust/5 border-l-4 border-tb-rust"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGradeInput(submission.grade?.toString() || "");
                      setFeedbackInput(submission.feedback || "");
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-tb-navy">
                          {submission.student_name}
                        </p>
                        <p className="text-sm text-tb-shadow">
                          {submission.student_email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(submission.status)}
                        {submission.grade != null && (
                          <span className="text-sm font-medium text-tb-navy">
                            {submission.grade}/{assignment?.max_points}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-tb-shadow">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {filteredSubmissions.length === 0 && (
                  <div className="p-8 text-center text-tb-shadow">
                    No submissions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grading Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedSubmission ? "Grade Submission" : "Select a Submission"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSubmission ? (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-tb-rust/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-tb-rust">
                        {selectedSubmission.student_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-tb-navy">
                        {selectedSubmission.student_name}
                      </p>
                      <p className="text-sm text-tb-shadow">
                        {selectedSubmission.student_email}
                      </p>
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      Student&apos;s Response
                    </label>
                    <div className="bg-tb-bone/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <p className="text-tb-navy whitespace-pre-wrap">
                        {selectedSubmission.content}
                      </p>
                    </div>
                    {selectedSubmission.file_url && (
                      <a
                        href={selectedSubmission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-tb-rust hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Attached File
                      </a>
                    )}
                  </div>

                  {/* Grade Input */}
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      Grade (0-{assignment?.max_points})
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        min={0}
                        max={assignment?.max_points}
                        className="w-24"
                      />
                      <span className="text-tb-shadow">
                        / {assignment?.max_points} points
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-tb-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tb-rust resize-y"
                      placeholder="Provide feedback to the student..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-tb-line">
                    <Button
                      variant="primary"
                      onClick={handleGrade}
                      disabled={grading || !gradeInput}
                      className="flex-1"
                    >
                      {grading ? "Saving..." : "Save Grade"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturn}
                      disabled={grading || !feedbackInput.trim()}
                      className="flex-1"
                    >
                      Return for Revision
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-tb-shadow">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Click on a submission to view and grade it</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
