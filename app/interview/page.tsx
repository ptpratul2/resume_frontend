
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
// import { API_AUTH } from "../create-job/page"
import { axiosConfig } from '@/lib/axios-config'
import { useRouter } from "next/navigation"
import { API_BASE_URL } from '@/lib/api-config'
import axiosInstance from '@/lib/axios-instance'
import { useCSRFToken } from '@/lib/use-csrf-token'
interface Candidate {
  id: string
  applicant_name: string
  email_id: string
  phone_number: string
  position: string
  experience: string
  skills: string[]
  resumeScore: number
  status: string
  appliedDate: string
  designation?: string
  interviewStatus?: string
  interviewDetails?: {
    date: string
    time: string
    type: "in-person" | "video" | "phone"
    location?: string
    interviewers: string[]
    round: number
    notes?: string
  }
}

interface InterviewSlot {
  date: string
  time: string
  available: boolean
  interviewer: string
}

export default function InterviewPage() {
  const router = useRouter();
  const [candidates, setCandidate] = useState<Candidate[]>([])

  const { token: csrfToken, loading: csrfLoading } = useCSRFToken()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDesignation, setFilterDesignation] = useState("all")

  const [availableInterviewers] = useState([
    "John Doe - Tech Lead",
    "Jane Smith - Senior Developer",
    "Mike Wilson - Engineering Manager",
    "Sarah Davis - HR Manager",
    "Alex Kumar - Product Manager",
  ])

  const fetchJobApplicant = async () => {
    if (csrfLoading) return;
    setIsLoading(true)
    setApiError(null)
    try {
      const applicantsResponse = await axiosInstance.get(
        `${API_BASE_URL}/api/resource/Job Applicant/?fields=["*"]`,
        {
          // ...axiosConfig,
          timeout: 10000,
        }
      );

      const interviewsResponse = await axiosInstance.get(
        `${API_BASE_URL}/api/resource/Interview/?fields=["*"]`,
        {
          // ...axiosConfig,
          timeout: 10000,
        }
      );

      console.log("API Response:", applicantsResponse.data);

      if (applicantsResponse.data && applicantsResponse.data.data) {
        const applicants = applicantsResponse.data.data;
        const interviews = interviewsResponse.data.data || [];

        // Map the API data and add interview status
        const mappedData = applicants.map((item: any) => {
          // Find matching interview by job_applicant field
          const interview = interviews.find((int: any) =>
            int.job_applicant === item.name || int.job_applicant === item.email_id
          );

          return {
            id: item.name || item.id,
            applicant_name: item.applicant_name || "Unknown",
            email_id: item.email_id || "",
            phone_number: item.phone_number || "",
            position: item.job_title || item.designation || "Not specified",
            designation: item.designation || "",
            experience: item.experience || "N/A",
            skills: item.skills ? (Array.isArray(item.skills) ? item.skills : []) : [],
            resumeScore: item.resume_score || 0,
            status: item.status || "Open",
            interviewStatus: interview ? interview.status : null,
            appliedDate: item.creation || item.applied_date || new Date().toISOString().split('T')[0],
            interviewDetails: interview ? {
              date: interview.date || "",
              time: interview.time || "",
              type: interview.type || "video",
              location: interview.location,
              interviewers: interview.interviewers || [],
              round: interview.round || 1,
              notes: interview.notes || ""
            } : undefined
          };
        });

        setCandidate(mappedData);
        console.log("Mapped candidates:", mappedData);
      }
    } catch (error: any) {
      console.error("Error fetching job applicants:", error);

      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
        setApiError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        setApiError("Network error: Unable to reach server. Please check if the API server is running.");
      } else {
        console.error("Request setup error:", error.message);
        setApiError(`Request error: ${error.message}`);
      }
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchJobApplicant()
  }, [csrfLoading])

  // derive unique lists for filters from fetched candidates
  const uniqueDesignations = Array.from(
    new Set(
      candidates
        .map(c => c.designation)
        .filter((d): d is string => Boolean(d) && d.trim() !== '')
    )
  )

  // For statuses we want both interviewStatus and status values, normalize to unique set
  const allStatusesSet = new Set<string>()
  candidates.forEach(c => {
    if (c.interviewStatus && c.interviewStatus.trim() !== '') allStatusesSet.add(c.interviewStatus)
    if (c.status && c.status.trim() !== '') allStatusesSet.add(c.status)
  })
  const uniqueStatuses = Array.from(allStatusesSet)

  // filtering combining both filters
  const filteredCandidates = candidates.filter((candidate) => {
    const statusMatch = filterStatus === "all" || candidate.status === filterStatus || candidate.interviewStatus === filterStatus
    const designationMatch = filterDesignation === "all" || candidate.designation === filterDesignation
    return statusMatch && designationMatch
  })

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    type: "video" as "in-person" | "video" | "phone",
    location: "",
    interviewers: [] as string[],
    round: 1,
    duration: "60",
    notes: "",
  })

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim() || ""

    if (normalizedStatus.includes("cleared") || normalizedStatus.includes("accept") || normalizedStatus.includes("hired")) {
      return "bg-green-100 text-green-800 border-green-200"
    } else if (normalizedStatus.includes("open") || normalizedStatus.includes("replied") || normalizedStatus.includes("hold") || normalizedStatus.includes("under review")) {
      return "bg-blue-100 text-blue-800 border-blue-200"
    } else if (normalizedStatus.includes("reject")) {
      return "bg-red-100 text-red-800 border-red-200"
    } else {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusText = (status: string) => {
    if (!status) return "Pending"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim() || ""

    if (normalizedStatus.includes("cleared") || normalizedStatus.includes("accept") || normalizedStatus.includes("hired")) {
      return <CheckCircle className="h-4 w-4" />
    } else if (normalizedStatus.includes("open") || normalizedStatus.includes("replied") || normalizedStatus.includes("hold") || normalizedStatus.includes("under review")) {
      return <Clock className="h-4 w-4" />
    } else if (normalizedStatus.includes("reject")) {
      return <XCircle className="h-4 w-4" />
    } else {
      return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleScheduleInterview = () => {
    console.log("Scheduling interview for:", selectedCandidate?.applicant_name, interviewForm)
    setShowScheduleForm(false)
    setInterviewForm({
      date: "",
      time: "",
      type: "video",
      location: "",
      interviewers: [],
      round: 1,
      duration: "60",
      notes: "",
    })
  }

  const handleInterviewerToggle = (interviewer: string) => {
    setInterviewForm((prev) => ({
      ...prev,
      interviewers: prev.interviewers.includes(interviewer)
        ? prev.interviewers.filter((i) => i !== interviewer)
        : [...prev.interviewers, interviewer],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Interview Management
              </h1>
            </div>
            <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Cleared">Cleared</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">API Connection Error</p>
                  <p className="text-sm text-red-700">{apiError}</p>
                  <p className="text-xs text-red-600 mt-1">Please check your API configuration.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {candidates.filter((c) => c.status === "Open" || c.interviewStatus === "Open").length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {candidates.filter((c) => c.interviewStatus === "Under Review").length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cleared</p>
                  <p className="text-3xl font-bold text-green-600">
                    {candidates.filter((c) => c.interviewStatus === "Cleared").length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {candidates.filter((c) => c.interviewStatus === "Rejected").length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span className="text-lg font-semibold">Candidates ({filteredCandidates.length})</span>
                    {isLoading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
                  </div>

                  {/* Filters placed to the right of the title (side-by-side) */}
                  <div className="flex items-center gap-3">
                    {/* Designation filter (dynamic values from API) */}
                    <div className="min-w-[160px]">
                      <Select value={filterDesignation} onValueChange={setFilterDesignation}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Designations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Designations</SelectItem>
                          {uniqueDesignations.map((desig) => (
                            <SelectItem key={desig} value={desig}>
                              {desig}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interview status filter (dynamic values + fallback options) */}
                    <div className="min-w-[160px]">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder=" Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Status</SelectItem>
                          {uniqueStatuses.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredCandidates.map((candidate, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-0 shadow-lg ${selectedCandidate?.id === candidate.id ? "ring-2 ring-blue-500" : ""
                      }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              {candidate.applicant_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold">{candidate.applicant_name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.position}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{candidate.email_id}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone_number}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <div className="flex flex-wrap gap-4 text-gray-700 text-sm mt-1">
                                {candidate.designation && (
                                  <div>
                                    <span>{candidate.designation}</span>
                                  </div>
                                )}
                                <div>
                                  <span>{candidate.interviewDetails ? candidate.interviewDetails.round ? `Round ${candidate.interviewDetails.round}` : (candidate.interviewStatus || candidate.status) : (candidate.interviewStatus || candidate.status)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(candidate.interviewStatus || candidate.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(candidate.interviewStatus || candidate.status)}
                              <span>{getStatusText(candidate.interviewStatus || candidate.status)}</span>
                            </div>
                          </Badge>
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">{candidate.resumeScore}%</div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                          </div>
                          {(() => {
                            const currentStatus = candidate.interviewStatus || candidate.status

                            if (currentStatus === "Cleared") {
                              return (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(
                                      `/candidate-feedback?candidateId=${encodeURIComponent(candidate.id)}&candidateName=${encodeURIComponent(candidate.applicant_name)}&candidateEmail=${encodeURIComponent(candidate.email_id)}`
                                    )
                                  }}
                                >
                                  Candidate Feedback
                                </Button>
                              )
                            } else if (currentStatus !== "Rejected") {
                              return (
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(
                                      `/Event?applicantId=${encodeURIComponent(candidate.id)}&applicantName=${encodeURIComponent(candidate.applicant_name)}&applicantEmail=${encodeURIComponent(candidate.email_id)}`
                                    )
                                  }}
                                >
                                  Interview Schedule
                                </Button>
                              )
                            }
                            return null
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Interview Management Panel */}
          <div className="space-y-6">
            {selectedCandidate ? (
              <>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Interview Management</span>
                    </CardTitle>
                    <CardDescription className="text-blue-100">For {selectedCandidate.applicant_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(selectedCandidate.status === "Open" || selectedCandidate.interviewStatus === "Open") && (
                      <Button
                        className="w-full bg-white text-blue-600 hover:bg-blue-50"
                        onClick={() => setShowScheduleForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    )}
                    {selectedCandidate.interviewStatus === "Under Review" && (
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => setShowScheduleForm(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reschedule Interview
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-green-500 hover:bg-green-600 text-white border-green-400"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </div>
                    )}
                    {selectedCandidate.interviewStatus === "Cleared" && (
                      <div className="text-center text-blue-100">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Interview Cleared</p>
                      </div>
                    )}
                    {selectedCandidate.interviewStatus === "Rejected" && (
                      <div className="text-center text-blue-100">
                        <XCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Interview Rejected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Interview Details */}
                {selectedCandidate.interviewDetails && (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Interview Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Date & Time:</span>
                          <p>
                            {selectedCandidate.interviewDetails.date} at {selectedCandidate.interviewDetails.time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Type:</span>
                          <p className="capitalize">{selectedCandidate.interviewDetails.type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Round:</span>
                          <p>Round {selectedCandidate.interviewDetails.round}</p>
                        </div>
                        {selectedCandidate.interviewDetails.location && (
                          <div>
                            <span className="font-medium text-muted-foreground">Location:</span>
                            <p>{selectedCandidate.interviewDetails.location}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Interviewers:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCandidate.interviewDetails.interviewers.map((interviewer) => (
                            <Badge key={interviewer} variant="outline">
                              {interviewer}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedCandidate.interviewDetails.notes && (
                        <div>
                          <span className="font-medium text-muted-foreground">Notes:</span>
                          <p className="text-sm mt-1">{selectedCandidate.interviewDetails.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Interview Form */}
                {showScheduleForm && (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Schedule Interview</CardTitle>
                      <CardDescription>Set up interview details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={interviewForm.date}
                            onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={interviewForm.time}
                            onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interview Type</Label>
                        <Select
                          value={interviewForm.type}
                          onValueChange={(value: "in-person" | "video" | "phone") =>
                            setInterviewForm({ ...interviewForm, type: value })
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video Call</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {interviewForm.type === "in-person" && (
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={interviewForm.location}
                            onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                            placeholder="Conference Room A"
                            className="h-12"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Select Interviewers</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableInterviewers.map((interviewer) => (
                            <div key={interviewer} className="flex items-center space-x-2">
                              <Checkbox
                                id={interviewer}
                                checked={interviewForm.interviewers.includes(interviewer)}
                                onCheckedChange={() => handleInterviewerToggle(interviewer)}
                              />
                              <Label htmlFor={interviewer} className="text-sm">
                                {interviewer}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="round">Interview Round</Label>
                          <Select
                            value={interviewForm.round.toString()}
                            onValueChange={(value) =>
                              setInterviewForm({ ...interviewForm, round: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Round 1 - Technical</SelectItem>
                              <SelectItem value="2">Round 2 - Managerial</SelectItem>
                              <SelectItem value="3">Round 3 - HR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Select
                            value={interviewForm.duration}
                            onValueChange={(value) => setInterviewForm({ ...interviewForm, duration: value })}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={interviewForm.notes}
                          onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                          placeholder="Any special instructions or notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={handleScheduleInterview} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          Schedule Interview
                        </Button>
                        <Button variant="outline" onClick={() => setShowScheduleForm(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Select a Candidate</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a candidate to schedule or manage their interview.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

