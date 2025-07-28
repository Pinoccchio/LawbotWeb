"use client"

import React, { useState } from "react"
import { X, BarChart3, Target, ArrowUpRight, PieChart, Users, Activity, BadgeCheck, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface UnitAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UnitAnalyticsModal({ isOpen, onClose }: UnitAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen) return null

  // Mock analytics data
  const unitsData = [
    {
      id: 1,
      name: "Cyber Crime Investigation Cell",
      activeCases: 45,
      resolvedCases: 123,
      officers: 8,
      successRate: 81,
      caseGrowth: "+12%",
      responseTime: "1.8 hrs",
      color: "bg-blue-500",
      primaryCrimes: ["Phishing", "Social Engineering"],
    },
    {
      id: 2,
      name: "Economic Offenses Wing",
      activeCases: 67,
      resolvedCases: 189,
      officers: 12,
      successRate: 76,
      caseGrowth: "+8%",
      responseTime: "2.2 hrs",
      color: "bg-green-500",
      primaryCrimes: ["Online Banking Fraud", "Credit Card Fraud"],
    },
    {
      id: 3,
      name: "Cyber Security Division",
      activeCases: 34,
      resolvedCases: 156,
      officers: 10,
      successRate: 85,
      caseGrowth: "+5%",
      responseTime: "1.5 hrs",
      color: "bg-purple-500",
      primaryCrimes: ["Identity Theft", "Data Breach"],
    },
    {
      id: 4,
      name: "Cyber Crime Technical Unit",
      activeCases: 23,
      resolvedCases: 89,
      officers: 6,
      successRate: 71,
      caseGrowth: "+15%",
      responseTime: "2.5 hrs",
      color: "bg-red-500",
      primaryCrimes: ["Ransomware", "Virus Attacks"],
    },
    {
      id: 5,
      name: "Cyber Crime Against Women and Children",
      activeCases: 56,
      resolvedCases: 234,
      officers: 9,
      successRate: 89,
      caseGrowth: "+18%",
      responseTime: "1.2 hrs",
      color: "bg-orange-500",
      primaryCrimes: ["Cyberstalking", "Online Harassment"],
    },
    {
      id: 6,
      name: "Special Investigation Team",
      activeCases: 12,
      resolvedCases: 67,
      officers: 7,
      successRate: 78,
      caseGrowth: "+7%",
      responseTime: "2.8 hrs",
      color: "bg-pink-500",
      primaryCrimes: ["Illegal Content Distribution", "Copyright Infringement"],
    },
  ]

  // Sort units by success rate for performance tab
  const unitsByPerformance = [...unitsData].sort((a, b) => b.successRate - a.successRate)
  
  // Sort units by active cases for workload tab
  const unitsByWorkload = [...unitsData].sort((a, b) => b.activeCases - a.activeCases)

  // Calculate totals for overview
  const totalActiveCases = unitsData.reduce((sum, unit) => sum + unit.activeCases, 0)
  const totalResolvedCases = unitsData.reduce((sum, unit) => sum + unit.resolvedCases, 0)
  const totalOfficers = unitsData.reduce((sum, unit) => sum + unit.officers, 0)
  const averageSuccessRate = Math.round(unitsData.reduce((sum, unit) => sum + unit.successRate, 0) / unitsData.length)
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative border-b border-slate-100 dark:border-slate-700 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-lawbot-blue-600 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">PNP Units Analytics</CardTitle>
              <CardDescription>
                Performance metrics and workload distribution across specialized units
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            📊 Real-time metrics
          </Badge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="workload">Workload</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active Cases</p>
                        <p className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{totalActiveCases}</p>
                      </div>
                      <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolved Cases</p>
                        <p className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{totalResolvedCases}</p>
                      </div>
                      <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                        <CheckCheck className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Officers</p>
                        <p className="text-2xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">{totalOfficers}</p>
                      </div>
                      <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Success Rate</p>
                        <p className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{averageSuccessRate}%</p>
                      </div>
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <BadgeCheck className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Case Distribution Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-lawbot-slate-800 dark:text-lawbot-slate-200">
                      Active Case Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unitsData.map((unit) => (
                        <div key={unit.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${unit.color} mr-2`}></div>
                              <span className="text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate max-w-[150px]">{unit.name}</span>
                            </div>
                            <span className="font-medium">{unit.activeCases}</span>
                          </div>
                          <Progress 
                            value={(unit.activeCases / totalActiveCases) * 100} 
                            className={`h-1.5 ${unit.color.replace('bg-', 'bg-opacity-70 bg-')} `}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Success Rate Comparison */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-lawbot-slate-800 dark:text-lawbot-slate-200">
                      Unit Success Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unitsData.map((unit) => (
                        <div key={unit.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${unit.color} mr-2`}></div>
                              <span className="text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate max-w-[150px]">{unit.name}</span>
                            </div>
                            <span className="font-medium">{unit.successRate}%</span>
                          </div>
                          <Progress 
                            value={unit.successRate} 
                            className={`h-1.5 ${
                              unit.successRate >= 80 ? 'bg-lawbot-emerald-500' :
                              unit.successRate >= 70 ? 'bg-lawbot-amber-500' :
                              'bg-lawbot-red-500'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              <div className="bg-lawbot-slate-50 dark:bg-lawbot-slate-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 mb-2">
                  Unit Performance Rankings
                </h3>
                <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                  Based on case resolution rates, response times, and officer efficiency
                </p>
              </div>
              
              <div className="space-y-4">
                {unitsByPerformance.map((unit, index) => (
                  <Card key={unit.id} className={`
                    border-l-4 
                    ${index === 0 ? 'border-l-lawbot-emerald-500 bg-lawbot-emerald-50/50 dark:bg-lawbot-emerald-900/10' : ''} 
                    ${index === 1 ? 'border-l-lawbot-blue-500 bg-lawbot-blue-50/50 dark:bg-lawbot-blue-900/10' : ''} 
                    ${index === 2 ? 'border-l-lawbot-purple-500 bg-lawbot-purple-50/50 dark:bg-lawbot-purple-900/10' : ''} 
                    ${index > 2 ? 'border-l-lawbot-slate-500 bg-lawbot-slate-50/50 dark:bg-lawbot-slate-700/10' : ''}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold 
                            ${index === 0 ? 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400' : ''} 
                            ${index === 1 ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' : ''} 
                            ${index === 2 ? 'text-lawbot-purple-600 dark:text-lawbot-purple-400' : ''} 
                            ${index > 2 ? 'text-lawbot-slate-600 dark:text-lawbot-slate-400' : ''}
                          ">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-lawbot-slate-900 dark:text-white">{unit.name}</h4>
                            <div className="flex items-center mt-1">
                              <Target className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                              <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                {unit.primaryCrimes.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold 
                            ${index === 0 ? 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400' : ''} 
                            ${index === 1 ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' : ''} 
                            ${index === 2 ? 'text-lawbot-purple-600 dark:text-lawbot-purple-400' : ''} 
                            ${index > 2 ? 'text-lawbot-slate-700 dark:text-lawbot-slate-300' : ''}
                          ">
                            {unit.successRate}%
                          </div>
                          <div className="flex items-center justify-end space-x-4 mt-1">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                              <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">{unit.officers}</span>
                            </div>
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                              <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">{unit.responseTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Workload Tab */}
            <TabsContent value="workload" className="space-y-6 mt-6">
              <div className="bg-lawbot-slate-50 dark:bg-lawbot-slate-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 mb-2">
                  Workload Distribution
                </h3>
                <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                  Active cases vs. officer capacity across specialized units
                </p>
              </div>
              
              <div className="space-y-4">
                {unitsByWorkload.map((unit) => {
                  const casesPerOfficer = Math.round(unit.activeCases / unit.officers)
                  const workloadLevel = 
                    casesPerOfficer >= 8 ? 'high' :
                    casesPerOfficer >= 5 ? 'medium' : 'low'
                  
                  return (
                    <Card key={unit.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lawbot-slate-900 dark:text-white">{unit.name}</h4>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  {unit.officers} Officers · {unit.activeCases} Active Cases
                                </span>
                              </div>
                            </div>
                            <Badge className={`
                              ${workloadLevel === 'high' ? 'bg-lawbot-red-100 text-lawbot-red-800 dark:bg-lawbot-red-900/20 dark:text-lawbot-red-300' : ''} 
                              ${workloadLevel === 'medium' ? 'bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/20 dark:text-lawbot-amber-300' : ''} 
                              ${workloadLevel === 'low' ? 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/20 dark:text-lawbot-emerald-300' : ''}
                            `}>
                              {workloadLevel === 'high' ? 'High Workload' : ''}
                              {workloadLevel === 'medium' ? 'Medium Workload' : ''}
                              {workloadLevel === 'low' ? 'Balanced Workload' : ''}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              <span>Cases per Officer</span>
                              <span className="font-medium">{casesPerOfficer}</span>
                            </div>
                            <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <Progress 
                                    value={(casesPerOfficer / 10) * 100} 
                                    className={`h-2 ${
                                      workloadLevel === 'high' ? 'bg-lawbot-red-500' :
                                      workloadLevel === 'medium' ? 'bg-lawbot-amber-500' :
                                      'bg-lawbot-emerald-500'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <ArrowUpRight className={`h-4 w-4 mr-1 ${
                                  unit.caseGrowth.startsWith('+') ? 'text-lawbot-red-500' : 'text-lawbot-emerald-500'
                                }`} />
                                <span className={`text-xs font-medium ${
                                  unit.caseGrowth.startsWith('+') ? 'text-lawbot-red-600 dark:text-lawbot-red-400' : 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400'
                                }`}>
                                  {unit.caseGrowth} Case Growth
                                </span>
                              </div>
                              <Button variant="outline" size="sm" className="h-7 text-xs">View Details</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}