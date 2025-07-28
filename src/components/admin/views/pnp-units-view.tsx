"use client"

import { Shield, Users, BarChart3, Plus, Edit, Activity, Target, TrendingUp, Award } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
            PNP Units Management
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Manage specialized cybercrime investigation units and officer assignments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="btn-modern">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Unit
          </Button>
        </div>
      </div>

      {/* Enhanced Unit Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Units</p>
                <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">10</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Specialized cybercrime units</p>
              </div>
              <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Officers</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">52</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Active investigators</p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active Cases</p>
                <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">237</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Currently under investigation</p>
              </div>
              <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolution Rate</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">82%</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Average across all units</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pnpUnits.map((unit, index) => {
          const totalCases = unit.resolvedCases + unit.activeCases
          const successRate = totalCases > 0 ? Math.round((unit.resolvedCases / totalCases) * 100) : 0
          return (
            <Card key={unit.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-xl ${unit.color} shadow-lg animate-pulse`}></div>
                    <div>
                      <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white">{unit.name}</CardTitle>
                      <CardDescription className="font-medium text-lawbot-blue-600 dark:text-lawbot-blue-400">
                        📍 {unit.category}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20">
                    <Edit className="h-4 w-4 text-lawbot-blue-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Enhanced Unit Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{unit.officers}</div>
                      <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">👮 Officers</div>
                    </div>
                    <div className="text-center p-3 bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{unit.activeCases}</div>
                      <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">🔍 Active</div>
                    </div>
                    <div className="text-center p-3 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{unit.resolvedCases}</div>
                      <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">✅ Resolved</div>
                    </div>
                  </div>

                  {/* Enhanced Crime Types */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                      Specialized Crime Types:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {unit.crimes.map((crime, index) => (
                        <Badge key={index} className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800 text-xs font-medium">
                          {crime}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Officers Display */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                      Unit Officers:
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(unit.officers, 5) }).map((_, index) => (
                          <Avatar key={index} className="h-8 w-8 border-2 border-white dark:border-lawbot-slate-800 ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                            <AvatarFallback className="text-xs bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white font-bold">
                              {String.fromCharCode(65 + index)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {unit.officers > 5 && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-600 border-2 border-white dark:border-lawbot-slate-800 flex items-center justify-center ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                            <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-300 font-bold">+{unit.officers - 5}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">total officers</div>
                    </div>
                  </div>

                  {/* Enhanced Performance Section */}
                  <div className="pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-lawbot-amber-500" />
                        Success Rate
                      </span>
                      <span className={`text-lg font-bold ${
                        successRate >= 80 ? 'text-lawbot-emerald-600' :
                        successRate >= 60 ? 'text-lawbot-amber-600' :
                        'text-lawbot-red-600'
                      }`}>
                        {successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          successRate >= 80 ? 'bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600' :
                          successRate >= 60 ? 'bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600' :
                          'bg-gradient-to-r from-lawbot-red-500 to-lawbot-red-600'
                        }`}
                        style={{ width: `${successRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Additional Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern border-dashed border-2 border-lawbot-blue-300 dark:border-lawbot-blue-700 bg-gradient-to-br from-lawbot-blue-50/50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 hover:border-lawbot-blue-400 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 rounded-xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-sm font-bold text-lawbot-slate-900 dark:text-white mb-2 text-center">
              Critical Infrastructure Protection
            </h3>
            <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 text-center mb-4">
              🏭 System Disruption & Sabotage
            </p>
            <Button variant="outline" size="sm" className="btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50">
              <Plus className="h-3 w-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="card-modern border-dashed border-2 border-lawbot-purple-300 dark:border-lawbot-purple-700 bg-gradient-to-br from-lawbot-purple-50/50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 hover:border-lawbot-purple-400 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 rounded-xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-sm font-bold text-lawbot-slate-900 dark:text-white mb-2 text-center">
              National Security Cyber Division
            </h3>
            <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 text-center mb-4">
              🏛️ Government & Terrorism
            </p>
            <Button variant="outline" size="sm" className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50">
              <Plus className="h-3 w-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="card-modern border-dashed border-2 border-lawbot-emerald-300 dark:border-lawbot-emerald-700 bg-gradient-to-br from-lawbot-emerald-50/50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 hover:border-lawbot-emerald-400 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 rounded-xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-sm font-bold text-lawbot-slate-900 dark:text-white mb-2 text-center">
              Advanced Cyber Forensics
            </h3>
            <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 text-center mb-4">
              🔍 Technical Exploitation
            </p>
            <Button variant="outline" size="sm" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50">
              <Plus className="h-3 w-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="card-modern border-dashed border-2 border-lawbot-amber-300 dark:border-lawbot-amber-700 bg-gradient-to-br from-lawbot-amber-50/50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 hover:border-lawbot-amber-400 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 rounded-xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-sm font-bold text-lawbot-slate-900 dark:text-white mb-2 text-center">
              Special Cyber Operations
            </h3>
            <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 text-center mb-4">
              🎯 Targeted Attacks
            </p>
            <Button variant="outline" size="sm" className="btn-modern border-lawbot-amber-300 text-lawbot-amber-600 hover:bg-lawbot-amber-50">
              <Plus className="h-3 w-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
