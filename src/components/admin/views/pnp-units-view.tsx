"use client"

import { Shield, Users, BarChart3, Plus, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function PNPUnitsView() {
  const pnpUnits = [
    {
      id: 1,
      name: "Cyber Crime Investigation Cell",
      category: "Communication & Social Media Crimes",
      officers: 8,
      activeCases: 45,
      resolvedCases: 123,
      color: "bg-blue-500",
      crimes: ["Phishing", "Social Engineering", "Spam Messages", "Fake Social Media Profiles"],
    },
    {
      id: 2,
      name: "Economic Offenses Wing",
      category: "Financial & Economic Crimes",
      officers: 12,
      activeCases: 67,
      resolvedCases: 189,
      color: "bg-green-500",
      crimes: ["Online Banking Fraud", "Credit Card Fraud", "Investment Scams", "Cryptocurrency Fraud"],
    },
    {
      id: 3,
      name: "Cyber Security Division",
      category: "Data & Privacy Crimes",
      officers: 10,
      activeCases: 34,
      resolvedCases: 156,
      color: "bg-purple-500",
      crimes: ["Identity Theft", "Data Breach", "Unauthorized System Access", "Corporate Espionage"],
    },
    {
      id: 4,
      name: "Cyber Crime Technical Unit",
      category: "Malware & System Attacks",
      officers: 6,
      activeCases: 23,
      resolvedCases: 89,
      color: "bg-red-500",
      crimes: ["Ransomware", "Virus Attacks", "Trojan Horses", "Spyware"],
    },
    {
      id: 5,
      name: "Cyber Crime Against Women and Children",
      category: "Harassment & Exploitation",
      officers: 9,
      activeCases: 56,
      resolvedCases: 234,
      color: "bg-orange-500",
      crimes: ["Cyberstalking", "Online Harassment", "Cyberbullying", "Revenge Porn"],
    },
    {
      id: 6,
      name: "Special Investigation Team",
      category: "Content-Related Crimes",
      officers: 7,
      activeCases: 12,
      resolvedCases: 67,
      color: "bg-pink-500",
      crimes: ["Child Sexual Abuse Material", "Illegal Content Distribution", "Copyright Infringement"],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">PNP Units Management</h2>
          <p className="text-gray-600 dark:text-slate-400">Manage specialized cybercrime investigation units</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Unit
        </Button>
      </div>

      {/* Unit Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Specialized cybercrime units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground">Active investigators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">237</div>
            <p className="text-xs text-muted-foreground">Currently under investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">Average across all units</p>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pnpUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${unit.color}`}></div>
                  <div>
                    <CardTitle className="text-lg">{unit.name}</CardTitle>
                    <CardDescription className="font-medium text-blue-600 dark:text-blue-400">
                      {unit.category}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Unit Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{unit.officers}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">Officers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{unit.activeCases}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{unit.resolvedCases}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">Resolved</div>
                  </div>
                </div>

                {/* Crime Types */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Specialized Crime Types:</h4>
                  <div className="flex flex-wrap gap-1">
                    {unit.crimes.map((crime, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {crime}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Officers */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Unit Officers:</h4>
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(unit.officers, 5) }).map((_, index) => (
                      <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-slate-800">
                        <AvatarFallback className="text-xs">{String.fromCharCode(65 + index)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {unit.officers > 5 && (
                      <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                        <span className="text-xs text-gray-600 dark:text-slate-400">+{unit.officers - 5}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round((unit.resolvedCases / (unit.resolvedCases + unit.activeCases)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed border-2 border-gray-300 dark:border-slate-600">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Critical Infrastructure Protection Unit
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-4">
              System Disruption & Sabotage Crimes
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Configure Unit
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-gray-300 dark:border-slate-600">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">National Security Cyber Division</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-4">Government & Terrorism Crimes</p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Configure Unit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
