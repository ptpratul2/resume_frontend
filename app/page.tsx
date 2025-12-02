"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Upload,
  MessageSquare,
  FileText,
  UserCheck,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Zap,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { API_BASE_URL } from '@/lib/api-config'

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "completed" | "current" | "pending"
  route?: string
  color: string
}

export default function RecruitmentDashboard() {
  const router = useRouter()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [workflowProgress, setWorkflowProgress] = useState(0)

  const handleLogout = async () => {
    const LOGOUT_URL = `${API_BASE_URL}/api/method/logout`;
    const response = await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

    });
    response.ok && router.push("/Login");
  }

  const workflowSteps: WorkflowStep[] = [
    {
      id: "job-opening",
      title: "Job Opening",
      description: "Create or select job opening",
      icon: <Briefcase className="h-5 w-5" />,
      status: selectedJobId ? "completed" : "current",
      route: "/create-job",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "job-opening",
      title: "Job Opening",
      description: "Create or select job opening",
      icon: <Briefcase className="h-5 w-5" />,
      status: selectedJobId ? "completed" : "current",
      route: "/job-opening",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "resume-upload",
      title: "Resume Collection",
      description: "Upload and process resumes",
      icon: <Upload className="h-5 w-5" />,
      status: selectedJobId ? "current" : "pending",
      route: "/upload-resumes",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "interview",
      title: "Interview Scheduling",
      description: "Schedule and conduct interviews",
      icon: <Calendar className="h-5 w-5" />,
      status: "pending",
      route: "/interview",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "feedback",
      title: "Candidate Feedback",
      description: "Review and provide feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "pending",
      route: "/feedback",
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "Document Verification",
      title: "Document Verification",
      description: "Verify Documents",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "pending",
      route: "/document-verify-list",
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "offer-letter",
      title: "Offer Letter",
      description: "Generate and send offers",
      icon: <FileText className="h-5 w-5" />,
      status: "pending",
      route: "/offer-list",
      color: "from-red-700 to-red-400"

    },
    {
      id: "appointment",
      title: "Appointment Letter",
      description: "Final appointment process",
      icon: <UserCheck className="h-5 w-5" />,
      status: "pending",
      route: "/appointment",
      color: "from-red-500 via-orange-500 to-yellow-400"

    },
  ]

  useEffect(() => {
    const completedSteps = workflowSteps.filter((step) => step.status === "completed").length
    const progress = (completedSteps / workflowSteps.length) * 100
    setWorkflowProgress(progress)
  }, [selectedJobId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "current":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "current":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Hero Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full">
              <img
                src="/vaaman_logo.png"
                alt="Vaaman Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Job Management System
              </h1>
              <p className="text-sm text-gray-600 mt-1">Streamline your recruitment workflow</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="default"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-32 -mt-32 opacity-50" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <span>Workflow Progress</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Track your recruitment pipeline in real-time
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg font-semibold px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
                {Math.round(workflowProgress)}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="relative">
              <Progress value={workflowProgress} className="h-3 bg-gray-200" />
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              {/* First Row - 4 items */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {workflowSteps.slice(1, 5).map((step, index) => (
                  <div key={step.id} className="relative group">
                    <Card
                      className={`transition-all duration-300 hover:shadow-xl border-2 bg-white ${step.status === "current"
                        ? "border-blue-400 shadow-lg shadow-blue-100"
                        : step.status === "completed"
                          ? "border-green-400 shadow-md shadow-green-100"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <CardContent className="p-5 text-center space-y-3">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${step.status === "completed"
                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                            : step.status === "current"
                              ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}
                        >
                          {step.status === "completed" ? <CheckCircle className="h-8 w-8" /> : step.icon}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-gray-800">{step.title}</h3>
                          <p className="text-xs text-gray-600 leading-snug">{step.description}</p>
                        </div>
                        <div className="flex items-center justify-center pt-1">
                          {getStatusIcon(step.status)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div> */}

              {/* Second Row - 3 items centered */}
              {/* <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                {workflowSteps.slice(5).map((step, index) => (
                  <div key={step.id} className="relative group">
                    <Card
                      className={`transition-all duration-300 hover:shadow-xl border-2 bg-white ${step.status === "current"
                        ? "border-blue-400 shadow-lg shadow-blue-100"
                        : step.status === "completed"
                          ? "border-green-400 shadow-md shadow-green-100"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <CardContent className="p-5 text-center space-y-3">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${step.status === "completed"
                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                            : step.status === "current"
                              ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}
                        >
                          {step.status === "completed" ? <CheckCircle className="h-8 w-8" /> : step.icon}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-gray-800">{step.title}</h3>
                          <p className="text-xs text-gray-600 leading-snug">{step.description}</p>
                        </div>
                        <div className="flex items-center justify-center pt-1">
                          {getStatusIcon(step.status)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div> */}

            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Job Opening */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-3xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="pb-4 relative">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                  <Plus className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Create New Job Opening</CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    Start a fresh recruitment process
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <Link href="/create-job">
                <Button className="w-full h-14 text-lg bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                  Create Job Opening
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Proceed with Existing */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-3xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="pb-4 relative">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                  <Briefcase className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Continue Existing Process</CardTitle>
                  <CardDescription className="text-emerald-100 text-base">
                    Resume ongoing recruitment workflows
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <Button
                className="w-full h-14 text-lg bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                onClick={() => setSelectedJobId("existing-job")}
              >
                Select Existing Job
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                <CardDescription className="text-base">Jump to any recruitment stage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* First Row - 4 items */}
              {workflowSteps.slice(1, 5).map((step) => (
                <Link key={step.id} href={step.route || "#"}>
                  <Button
                    variant="outline"
                    className={`w-full h-auto p-5 flex flex-col items-center space-y-3 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${step.color} text-white border-0 rounded-xl group hover:scale-105`}
                  >
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold block">{step.title}</span>
                      <p className="text-xs opacity-90 mt-1">{step.description}</p>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>

            {/* Second Row - 3 items centered */}
            <div className="grid grid-cols-3 gap-4 mt-4 max-w-4xl mx-auto">
              {workflowSteps.slice(5).map((step) => (
                <Link key={step.id} href={step.route || "#"}>
                  <Button
                    variant="outline"
                    className={`w-full h-auto p-5 flex flex-col items-center space-y-3 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${step.color} text-white border-0 rounded-xl group hover:scale-105`}
                  >
                    <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold block">{step.title}</span>
                      <p className="text-xs opacity-90 mt-1">{step.description}</p>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
