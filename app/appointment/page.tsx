"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { API_BASE_URL } from '@/lib/api-config'
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
// import { UserCheck, Send, Download, ArrowLeft, Calendar, FileText, Plus, Trash2, AlertCircle } from "lucide-react"
import {
  UserCheck,
  Send,
  Download,
  ArrowLeft,
  Calendar,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  Briefcase
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AcceptedCandidate {
  name: string
  applicant_name: string
  applicant_email: string
  designation: string
  offer_date: string
  company: string
  status: string
  appointment_letter_status?: string
}

interface Template {
  name: string
  introduction: string
}

interface TermRow {
  title: string
  description: string
}

interface TemplateDetails {
  name: string
  introduction: string
  closing_notes: string
  terms: TermRow[]
}

interface AppointmentLetterDetails {
  name: string
  job_applicant: string
  applicant_name: string
  company: string
  appointment_date: string
  appointment_letter_template: string
  introduction: string
  closing_notes: string
  terms: TermRow[]
}

export default function AppointmentPage() {
  const [acceptedCandidates, setAcceptedCandidates] = useState<AcceptedCandidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<AcceptedCandidate | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [savedAppointment, setSavedAppointment] = useState<any>(null)

  const [appointmentDetails, setAppointmentDetails] = useState({
    job_applicant: "",
    applicant_name: "",
    company: "",
    appointment_date: "",
    appointment_letter_template: "",
    introduction: "",
    closing_notes: "",
    terms: [] as TermRow[]
  })

  const [documentsChecklist, setDocumentsChecklist] = useState({
    aadhar: false,
    pan: false,
    passport: false,
    education: false,
    experience: false,
    medical: false,
    bankDetails: false,
    photos: false,
  })


  useEffect(() => {
    fetchAcceptedOffers()
    fetchTemplates()
  }, [])

  const fetchAcceptedOffers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/method/resume.api.get_accepted_job_offers`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} `)
      }

      const jsonData = await res.json()
      if (jsonData?.message?.success) {
        const candidates = jsonData.message.data || []

        // Check appointment letter status for each candidate
        const candidatesWithStatus = await Promise.all(
          candidates.map(async (candidate: AcceptedCandidate) => {
            try {
              const statusRes = await fetch(
                `${API_BASE_URL}/api/method/resume.api.check_appointment_letter_exists?job_applicant=${encodeURIComponent(candidate.name)}`,
                {
                  method: 'GET',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                }
              )

              if (statusRes.ok) {
                const statusData = await statusRes.json()
                return {
                  ...candidate,
                  appointment_letter_status: statusData?.message?.exists ? "Close" : "Open"
                }
              }
            } catch (err) {
              console.error("Error checking status:", err)
            }
            return { ...candidate, appointment_letter_status: "Open" }
          })
        )

        setAcceptedCandidates(candidatesWithStatus)
      } else {
        setError("Failed to fetch accepted offers")
      }
    } catch (err) {
      console.error("Error fetching offers:", err)
      setError("Error fetching accepted offers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/method/resume.api.get_appointment_letter_templates`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} `)
      }

      const jsonData = await res.json()
      if (jsonData?.message?.success) {
        setTemplates(jsonData.message.data || [])
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
    }
  }

  const fetchAppointmentLetterDetails = async (jobApplicant: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/method/resume.api.get_appointment_letter_by_job_applicant?job_applicant=${encodeURIComponent(jobApplicant)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} `)
      }

      const jsonData = await res.json()
      if (jsonData?.message?.success && jsonData?.message?.data) {
        return jsonData.message.data
      }
    } catch (err) {
      console.error("Error fetching appointment letter details:", err)
    }
    return null
  }

  const handleCandidateSelect = async (candidate: AcceptedCandidate) => {
    setSelectedCandidate(candidate)
    setError(null)
    setSuccess(null)
    setSavedAppointment(null)

    if (candidate.appointment_letter_status === "Close") {
      // Fetch and display existing appointment letter
      const existingLetter = await fetchAppointmentLetterDetails(candidate.name)
      if (existingLetter) {
        setSavedAppointment({
          appointmentId: existingLetter.name,
          job_applicant: existingLetter.job_applicant,
          candidateName: existingLetter.applicant_name,
          designation: candidate.designation,
          company: existingLetter.company,
          appointment_date: existingLetter.appointment_date,
          appointment_letter_template: existingLetter.appointment_letter_template,
          introduction: existingLetter.introduction,
          closing_notes: existingLetter.closing_notes,
          terms: existingLetter.terms
        })
      }
      return
    }

    setAppointmentDetails({
      job_applicant: candidate.name,
      applicant_name: candidate.applicant_name,
      company: candidate.company,
      appointment_date: "",
      appointment_letter_template: "",
      introduction: "",
      closing_notes: "",
      terms: []
    })
  }

  const handleTemplateSelect = async (templateName: string) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/method/resume.api.get_appointment_letter_template_details?template_name=${encodeURIComponent(templateName)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} `)
      }

      const jsonData = await res.json()

      if (jsonData?.message?.success) {
        const templateData: TemplateDetails = jsonData.message.data
        setAppointmentDetails({
          ...appointmentDetails,
          appointment_letter_template: templateName,
          introduction: templateData.introduction || "",
          closing_notes: templateData.closing_notes || "",
          terms: templateData.terms || []
        })
      } else {
        setError("Error loading template: " + (jsonData?.message?.message || "Unknown error"))
      }
    } catch (err) {
      console.error("Error fetching template details:", err)
      setError("Error fetching template details. Please try again.")
    }
  }

  const handleAddTerm = () => {
    setAppointmentDetails({
      ...appointmentDetails,
      terms: [...appointmentDetails.terms, { title: "", description: "" }]
    })
  }

  const handleRemoveTerm = (index: number) => {
    const newTerms = appointmentDetails.terms.filter((_, i) => i !== index)
    setAppointmentDetails({
      ...appointmentDetails,
      terms: newTerms
    })
  }

  const handleTermChange = (index: number, field: "title" | "description", value: string) => {
    const newTerms = [...appointmentDetails.terms]
    newTerms[index][field] = value
    setAppointmentDetails({
      ...appointmentDetails,
      terms: newTerms
    })
  }

  const validateForm = (): boolean => {
    if (!appointmentDetails.job_applicant) {
      setError("Please select a candidate")
      return false
    }
    if (!appointmentDetails.applicant_name) {
      setError("Applicant name is missing")
      return false
    }
    if (!appointmentDetails.appointment_date) {
      setError("Please select an appointment date")
      return false
    }
    if (!appointmentDetails.appointment_letter_template) {
      setError("Please select a template")
      return false
    }
    return true
  }

  const handleCreateAppointment = async () => {
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const csrfMatch = document.cookie.match(/csrf_token=([^;]+)/)
      const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]) : ''

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }

      if (csrfToken) {
        headers["X-Frappe-CSRF-Token"] = csrfToken
      }

      const res = await fetch(`${API_BASE_URL}/api/method/resume.api.create_appointment_letter`, {
        method: "POST",
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ data: appointmentDetails })
      })

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Permission denied. Make sure your Python backend has 'allow_guest=True' and 'ignore_permissions=True'")
        } else if (res.status === 401) {
          throw new Error("Authentication required. Please log in to Frappe")
        } else if (res.status === 404) {
          throw new Error("API endpoint not found. Please check the server configuration")
        }
        throw new Error(`HTTP error! status: ${res.status} `)
      }

      const jsonData = await res.json()

      if (jsonData?.message?.success) {
        setSuccess("Appointment Letter created successfully! (ID: " + jsonData.message.data.name + ")")

        const previewData = {
          appointmentId: jsonData.message.data.name,
          job_applicant: jsonData.message.data.job_applicant || appointmentDetails.job_applicant,
          candidateName: jsonData.message.data.applicant_name || selectedCandidate?.applicant_name,
          designation: selectedCandidate?.designation,
          company: jsonData.message.data.company || appointmentDetails.company,
          appointment_date: jsonData.message.data.appointment_date || appointmentDetails.appointment_date,
          appointment_letter_template: jsonData.message.data.appointment_letter_template || appointmentDetails.appointment_letter_template,
          introduction: jsonData.message.data.introduction || appointmentDetails.introduction,
          closing_notes: jsonData.message.data.closing_notes || appointmentDetails.closing_notes,
          terms: jsonData.message.data.terms || appointmentDetails.terms
        }

        setSavedAppointment(previewData)

        // Update the candidate status to "Close"
        if (selectedCandidate) {
          const updatedCandidates = acceptedCandidates.map(c =>
            c.name === selectedCandidate.name
              ? { ...c, appointment_letter_status: "Close" }
              : c
          )
          setAcceptedCandidates(updatedCandidates)
          setSelectedCandidate({ ...selectedCandidate, appointment_letter_status: "Close" })
        }

        setDocumentsChecklist({
          aadhar: false,
          pan: false,
          passport: false,
          education: false,
          experience: false,
          medical: false,
          bankDetails: false,
          photos: false,
        })
      } else {
        setError("Error: " + (jsonData?.message?.message || jsonData?.message || "Unknown error"))
      }
    } catch (err) {
      console.error("Error creating appointment:", err)
      setError(err instanceof Error ? err.message : "Error creating appointment letter")
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentCheck = (document: string, checked: boolean) => {
    setDocumentsChecklist((prev) => ({
      ...prev,
      [document]: checked,
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "close":
        return "bg-red-500"
      case "open":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  if (loading && acceptedCandidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Offers
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Appointment Letters
              </h1>
            </div>
            <p className="text-muted-foreground">Generate appointment letters for candidates who accepted offers</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Accepted Offers ({acceptedCandidates.length})</span>
                </CardTitle>
                <CardDescription>Candidates ready for appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {acceptedCandidates.length > 0 ? (
                  acceptedCandidates.map((candidate) => (
                    <Card
                      key={candidate.name}
                      className={`cursor - pointer transition - all duration - 300 hover: shadow - md ${selectedCandidate?.name === candidate.name ? "ring-2 ring-blue-500" : ""
                        } `}
                      onClick={() => handleCandidateSelect(candidate)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                                {candidate.applicant_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-semibold text-sm">{candidate.applicant_name}</h3>
                              <p className="text-xs text-muted-foreground">{candidate.designation}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Offer: {candidate.offer_date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(candidate.appointment_letter_status || "Open")} text - white`}>
                            {candidate.appointment_letter_status || "Open"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No accepted offers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedCandidate ? (
              <>
                {selectedCandidate.appointment_letter_status === "Close" ? (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Appointment Letter</span>
                        </span>
                        <Badge className="bg-red-500 text-white">Close</Badge>
                      </CardTitle>
                      <CardDescription>Appointment letter has been created for {selectedCandidate.applicant_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {savedAppointment ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 space-y-6">
                          <div className="text-center space-y-2 border-b pb-6">
                            <h2 className="text-2xl font-bold">APPOINTMENT LETTER</h2>
                            <p className="text-gray-600">{savedAppointment.company}</p>
                          </div>

                          <div className="space-y-4">
                            <p className="text-gray-900">
                              <span className="font-semibold">Dear {savedAppointment.candidateName},</span>
                            </p>
                            <p className="text-gray-700">
                              We are pleased to confirm your appointment as <span className="font-semibold">{savedAppointment.designation}</span> with our organization.
                            </p>
                          </div>

                          {savedAppointment.introduction && (
                            <div className="text-gray-700 whitespace-pre-line">
                              {savedAppointment.introduction}
                            </div>
                          )}

                          {savedAppointment.terms && savedAppointment.terms.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {savedAppointment.terms.map((term: TermRow, index: number) => (
                                  <div key={index}>
                                    <p className="text-sm font-semibold text-gray-900">{index + 1}. {term.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{term.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {savedAppointment.closing_notes && (
                            <div className="text-gray-700 whitespace-pre-line">
                              {savedAppointment.closing_notes}
                            </div>
                          )}

                          <div className="text-center text-sm text-gray-500 pt-4 border-t">
                            <p>Appointment letter has been successfully created.</p>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              disabled
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Letter
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">Loading appointment letter...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <UserCheck className="h-5 w-5" />
                          <span>Generate Appointment Letter</span>
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                          For {selectedCandidate.applicant_name} - {selectedCandidate.designation}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Document Verification</span>
                        </CardTitle>
                        <CardDescription>Verify all required documents are received</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(documentsChecklist).map(([doc, checked]) => (
                            <div key={doc} className="flex items-center space-x-2">
                              <Checkbox
                                id={doc}
                                checked={checked}
                                onCheckedChange={(checked) => handleDocumentCheck(doc, !!checked)}
                              />
                              <Label htmlFor={doc} className="text-sm capitalize cursor-pointer">
                                {doc.replace(/([A-Z])/g, " $1").trim()}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Appointment Details
                        </CardTitle>
                        <CardDescription>Fill in the appointment letter details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="job_applicant" className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              Job Applicant
                            </Label>
                            <Input
                              id="job_applicant"
                              value={selectedCandidate.applicant_name}
                              disabled
                              className="bg-gray-50 h-11 shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company" className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              Company
                            </Label>
                            <Input
                              id="company"
                              value={appointmentDetails.company}
                              disabled
                              className="bg-gray-50 h-11 shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="appointment_date" className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              Appointment Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="appointment_date"
                              type="date"
                              value={appointmentDetails.appointment_date}
                              onChange={(e) =>
                                setAppointmentDetails({ ...appointmentDetails, appointment_date: e.target.value })
                              }
                              required
                              className="h-11 shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="template" className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              Appointment Letter Template <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={appointmentDetails.appointment_letter_template}
                              onValueChange={handleTemplateSelect}
                            >
                              <SelectTrigger className="h-11 shadow-sm">
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map((template) => (
                                  <SelectItem key={template.name} value={template.name}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {appointmentDetails.appointment_letter_template && (
                              <p className="text-xs text-blue-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Template loaded successfully
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="introduction" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Introduction
                          </Label>
                          <Textarea
                            id="introduction"
                            value={appointmentDetails.introduction}
                            onChange={(e) =>
                              setAppointmentDetails({ ...appointmentDetails, introduction: e.target.value })
                            }
                            placeholder="Introduction text..."
                            rows={3}
                            className="shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="closing_notes" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Closing Notes
                          </Label>
                          <Textarea
                            id="closing_notes"
                            value={appointmentDetails.closing_notes}
                            onChange={(e) =>
                              setAppointmentDetails({ ...appointmentDetails, closing_notes: e.target.value })
                            }
                            placeholder="Closing notes..."
                            rows={3}
                            className="shadow-sm"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              Terms & Conditions
                              {appointmentDetails.terms.length > 0 && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                  {appointmentDetails.terms.length} term{appointmentDetails.terms.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </Label>
                            <Button
                              onClick={handleAddTerm}
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Term
                            </Button>
                          </div>

                          {appointmentDetails.terms.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                              <table className="w-full">
                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">No.</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {appointmentDetails.terms.map((term, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-500">{index + 1}</td>
                                      <td className="px-4 py-3">
                                        <Input
                                          value={term.title}
                                          onChange={(e) => handleTermChange(index, "title", e.target.value)}
                                          placeholder="e.g., Probation Period"
                                          className="text-sm h-10 shadow-sm"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <Input
                                          value={term.description}
                                          onChange={(e) => handleTermChange(index, "description", e.target.value)}
                                          placeholder="e.g., 6 months from date of joining"
                                          className="text-sm h-10 shadow-sm"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <Button
                                          onClick={() => handleRemoveTerm(index)}
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-600">No terms added yet</p>
                              <p className="text-xs text-gray-500 mt-1">Select a template or add terms manually</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                          <Button
                            type="button"
                            onClick={handleCreateAppointment}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 shadow-lg hover:shadow-xl transition-all"
                            disabled={loading || !appointmentDetails.appointment_date || !appointmentDetails.appointment_letter_template}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Save Appointment Letter
                              </span>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-11 shadow-sm"
                            disabled
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button
                            type="button"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 shadow-md"
                            disabled
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Letter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {savedAppointment && (
                      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>Appointment Letter Preview</span>
                            </span>
                            <Badge className="bg-green-500 text-white">Saved</Badge>
                          </CardTitle>
                          <CardDescription>Preview of the appointment letter details</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 space-y-6">
                            <div className="text-center space-y-2 border-b pb-6">
                              <h2 className="text-2xl font-bold">APPOINTMENT LETTER</h2>
                              <p className="text-gray-600">{savedAppointment.company}</p>
                            </div>

                            <div className="space-y-4">
                              <p className="text-gray-900">
                                <span className="font-semibold">Dear {savedAppointment.candidateName},</span>
                              </p>
                              <p className="text-gray-700">
                                We are pleased to confirm your appointment as <span className="font-semibold">{savedAppointment.designation}</span> with our organization.
                              </p>
                            </div>

                            {savedAppointment.introduction && (
                              <div className="text-gray-700 whitespace-pre-line">
                                {savedAppointment.introduction}
                              </div>
                            )}

                            {savedAppointment.terms && savedAppointment.terms.length > 0 && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                  {savedAppointment.terms.map((term: TermRow, index: number) => (
                                    <div key={index}>
                                      <p className="text-sm font-semibold text-gray-900">{index + 1}. {term.title}</p>
                                      <p className="text-sm text-gray-700 mt-1">{term.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {savedAppointment.closing_notes && (
                              <div className="text-gray-700 whitespace-pre-line">
                                {savedAppointment.closing_notes}
                              </div>
                            )}

                            <div className="text-center text-sm text-gray-500 pt-4 border-t">
                              <p>This is a preview. The actual appointment letter will contain complete terms and conditions.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSavedAppointment(null)}
                              >
                                Close Preview
                              </Button>
                              <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Letter
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Candidate</h3>
                  <p className="text-muted-foreground">
                    Choose a candidate who has accepted the offer to generate their appointment letter.
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
