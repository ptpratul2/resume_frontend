"use client"
import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Clock, MapPin, Video, FileText, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface Interviewer {
  name: string
  full_name: string
  email: string
}

interface InterviewRound {
  name: string
  round_name: string
}

interface Location {
  name: string
}

function EventPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const applicantId = searchParams.get('applicantId')
  const applicantName = searchParams.get('applicantName')
  const applicantEmail = searchParams.get('applicantEmail')

  useEffect(() => {
    console.log("=== URL Parameters ===")
    console.log("applicantId:", applicantId)
    console.log("applicantName:", applicantName)
    console.log("applicantEmail:", applicantEmail)
    console.log("Full URL:", window.location.href)
  }, [applicantId, applicantName, applicantEmail])

  const [eventForm, setEventForm] = useState({
    interviewRound: "",
    jobApplicant: applicantId || "",
    resumeLink: "",
    meetingLink: "",
    location: "",
    status: "Pending",
    scheduledOn: "",
    fromTime: "",
    toTime: "",
    interviewers: [] as string[],
  })

  const [availableInterviewers, setAvailableInterviewers] = useState<Interviewer[]>([])
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const statusOptions = ["Pending", "Under Review", "Cleared", "Rejected"]

  useEffect(() => {
    fetchInterviewers()
    fetchInterviewRounds()
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `http://172.23.88.43:8000/api/resource/Location?fields=["name"]&limit_page_length=100`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      if (data && data.data) {
        setLocations(data.data)
        console.log("Fetched locations:", data.data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchInterviewRounds = async () => {
    try {
      const response = await fetch(
        `http://172.23.88.43:8000/api/resource/Interview Round?fields=["name","round_name"]&limit_page_length=100`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      if (data && data.data) {
        setInterviewRounds(data.data)
        console.log("Fetched interview rounds:", data.data)
      }
    } catch (error) {
      console.error("Error fetching interview rounds:", error)
      setInterviewRounds([
        { name: "First Round", round_name: "First Round" },
        { name: "Second Round", round_name: "Second Round" },
        { name: "Final Round", round_name: "Final Round" },
      ])
    }
  }

  const fetchInterviewers = async () => {
    try {
      const response = await fetch(
        `http://172.23.88.43:8000/api/resource/User?fields=["name","full_name","email"]&filters=[["enabled","=",1]]&limit_page_length=100`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      if (data && data.data) {
        const filteredUsers = data.data.filter(
          (user: any) => user.name !== "Administrator" && user.name !== "Guest"
        )
        setAvailableInterviewers(filteredUsers)
        console.log("Fetched interviewers:", filteredUsers)
      }
    } catch (error) {
      console.error("Error fetching interviewers:", error)
    }
  }

  const handleInterviewerToggle = (interviewer: string) => {
    setEventForm((prev) => ({
      ...prev,
      interviewers: prev.interviewers.includes(interviewer)
        ? prev.interviewers.filter((i) => i !== interviewer)
        : [...prev.interviewers, interviewer],
    }))
  }

  const handleSaveEvent = async () => {
    if (!eventForm.interviewRound || !eventForm.jobApplicant || !eventForm.scheduledOn || !eventForm.fromTime || !eventForm.toTime) {
      alert("Please fill all required fields")
      return
    }

    console.log("=== DEBUG ===");
    console.log("Meeting Link from state:", eventForm.meetingLink);

    setIsSaving(true)
    try {
      // Prepare interview data
      const interviewData = {
        doctype: "Interview",
        interview_round: eventForm.interviewRound,
        job_applicant: eventForm.jobApplicant,
        resume_link: eventForm.resumeLink || '',
        meeting_link: eventForm.meetingLink || '',
        location: eventForm.location || '',
        status: eventForm.status,
        scheduled_on: eventForm.scheduledOn,
        from_time: eventForm.fromTime,
        to_time: eventForm.toTime,
        interview_details: eventForm.interviewers.map((interviewer) => ({
          doctype: "Interview Detail",
          interviewer: interviewer
        }))
      };

      console.log("Interview data:", JSON.stringify(interviewData, null, 2));

      const response = await fetch(
        `http://172.23.88.43:8000/api/resource/Interview`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(interviewData)
        }
      )

      const data = await response.json()
      console.log("API Response:", data);

      if (data && data.message) {
        alert(data.message.message || "Interview created successfully!")
        console.log("Created interview:", data)
        router.back()
      }
    } catch (error: any) {
      console.error("Error creating interview:", error)
      alert("Failed to create interview: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Schedule New Interview
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[92px]">Create and schedule a new interview event for candidates</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Applicant Info Card */}
          {applicantId && applicantName && (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">Interview Candidate</p>
                    <h3 className="text-xl font-bold">{applicantName}</h3>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!applicantId && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-yellow-50/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">No applicant selected. Please go back and select a candidate.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Details Card */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Interview Round <span className="text-red-500">*</span>
                  </Label>
                  {interviewRounds.length > 0 ? (
                    <Select
                      value={eventForm.interviewRound}
                      onValueChange={(value) => setEventForm({ ...eventForm, interviewRound: value })}
                    >
                      <SelectTrigger className="h-11 shadow-sm">
                        <SelectValue placeholder="Select interview round" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewRounds.map((round) => (
                          <SelectItem key={round.name} value={round.name}>
                            {round.round_name || round.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={eventForm.interviewRound}
                      onChange={(e) => setEventForm({ ...eventForm, interviewRound: e.target.value })}
                      placeholder="Loading rounds..."
                      className="h-11 shadow-sm"
                      disabled
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 w-4 rounded-full p-0 border-2 border-blue-500" />
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={eventForm.status}
                    onValueChange={(value) => setEventForm({ ...eventForm, status: value })}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${status === "Cleared" ? "bg-green-500" :
                              status === "Rejected" ? "bg-red-500" :
                                status === "Under Review" ? "bg-yellow-500" :
                                  "bg-blue-500"
                              }`} />
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Resume Link
                </Label>
                <Input
                  type="url"
                  value={eventForm.resumeLink}
                  onChange={(e) => setEventForm({ ...eventForm, resumeLink: e.target.value })}
                  placeholder="https://example.com/resume.pdf"
                  className="h-11 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  Meeting Link
                </Label>
                <Input
                  type="url"
                  value={eventForm.meetingLink}
                  onChange={(e) => setEventForm({ ...eventForm, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/123456789 or Google Meet link"
                  className="h-11 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Location
                </Label>
                {locations.length > 0 ? (
                  <Select
                    value={eventForm.location}
                    onValueChange={(value) => setEventForm({ ...eventForm, location: value })}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Loading locations..."
                    className="h-11 shadow-sm"
                    disabled
                  />
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={eventForm.scheduledOn}
                    onChange={(e) => setEventForm({ ...eventForm, scheduledOn: e.target.value })}
                    className="h-11 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    From <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={eventForm.fromTime}
                    onChange={(e) => setEventForm({ ...eventForm, fromTime: e.target.value })}
                    className="h-11 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    To <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={eventForm.toTime}
                    onChange={(e) => setEventForm({ ...eventForm, toTime: e.target.value })}
                    className="h-11 shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interviewers Section */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Select Interviewers
                </CardTitle>
                {eventForm.interviewers.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {eventForm.interviewers.length} selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b sticky top-0">
                      <tr>
                        <th className="text-left p-4 w-12">
                          <Checkbox disabled />
                        </th>
                        <th className="text-left p-4 w-16 text-xs font-semibold text-gray-700 uppercase tracking-wider">No.</th>
                        <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Interviewer Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {availableInterviewers.length > 0 ? (
                        availableInterviewers.map((interviewer, index) => (
                          <tr
                            key={interviewer.name}
                            className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => handleInterviewerToggle(interviewer.name)}
                          >
                            <td className="p-4">
                              <Checkbox
                                checked={eventForm.interviewers.includes(interviewer.name)}
                                onCheckedChange={() => handleInterviewerToggle(interviewer.name)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="p-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm">
                                  {(interviewer.full_name || interviewer.name).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {interviewer.full_name || interviewer.name}
                                  </span>
                                  <span className="text-xs text-gray-500">{interviewer.email}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-12 w-12 text-gray-300" />
                              <p className="text-sm font-medium">Loading interviewers...</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="px-6 h-11 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEvent}
              disabled={isSaving || !applicantId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-11 shadow-lg hover:shadow-xl transition-all"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Create Interview"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function EventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EventPageContent />
    </Suspense>
  )
}