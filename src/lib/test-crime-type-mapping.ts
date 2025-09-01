// Test Crime Type Mapping
// This file tests the crime type translation system to ensure all mappings work correctly

import CrimeTypeMapper from './crime-type-mapping'

interface TestResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

/**
 * Test Suite for Crime Type Mapping System
 */
export class CrimeTypeMappingTests {
  private results: TestResult[] = []

  /**
   * Run all tests and return results
   */
  public runAllTests(): TestResult[] {
    this.results = []
    
    console.log('🧪 Starting Crime Type Mapping Tests...')
    
    // Core functionality tests
    this.testEnumToDisplayNameMapping()
    this.testDisplayNameToEnumMapping()
    this.testCaseInsensitiveMatching()
    this.testInvalidInputs()
    this.testCategoryMapping()
    this.testUnitMapping()
    this.testNormalizationFunction()
    this.testPotentialMatches()
    
    // Specific problematic cases
    this.testProblematicCases()
    this.testAllMappingsExist()
    
    // Database compatibility tests
    this.testDatabaseCompatibility()
    
    console.log(`🧪 Tests completed: ${this.results.length} tests run`)
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    
    console.log(`✅ Passed: ${passed}, ❌ Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('Failed tests:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.testName}: ${r.message}`)
      })
    }
    
    return this.results
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details })
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${testName}: ${message}`)
  }

  private testEnumToDisplayNameMapping() {
    const testCases = [
      { enum: 'onlinePredatoryBehavior', expected: 'Online Predatory Behavior' },
      { enum: 'cyberbullying', expected: 'Cyberbullying' },
      { enum: 'phishing', expected: 'Phishing' },
      { enum: 'businessEmailCompromise', expected: 'Business Email Compromise' },
      { enum: 'denialOfServiceAttacks', expected: 'Denial of Service Attacks' },
      { enum: 'advancedPersistentThreats', expected: 'Advanced Persistent Threats' }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.enumToDisplayName(testCase.enum)
      const passed = result === testCase.expected
      this.addResult(
        `enumToDisplayName: ${testCase.enum}`,
        passed,
        passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expected}", got "${result}"`
      )
    }
  }

  private testDisplayNameToEnumMapping() {
    const testCases = [
      { display: 'Online Predatory Behavior', expected: 'onlinePredatoryBehavior' },
      { display: 'Cyberbullying', expected: 'cyberbullying' },
      { display: 'Phishing', expected: 'phishing' },
      { display: 'Business Email Compromise', expected: 'businessEmailCompromise' },
      { display: 'Denial of Service Attacks', expected: 'denialOfServiceAttacks' }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.displayNameToEnum(testCase.display)
      const passed = result === testCase.expected
      this.addResult(
        `displayNameToEnum: ${testCase.display}`,
        passed,
        passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expected}", got "${result}"`
      )
    }
  }

  private testCaseInsensitiveMatching() {
    const testCases = [
      { input: 'ONLINEPREDATORYBEHAVIOR', expectedDisplay: 'Online Predatory Behavior' },
      { input: 'cyberbullying', expectedDisplay: 'Cyberbullying' },
      { input: 'PHISHING', expectedDisplay: 'Phishing' },
      { input: 'online predatory behavior', expectedEnum: 'onlinePredatoryBehavior' }
    ]

    for (const testCase of testCases) {
      if ('expectedDisplay' in testCase) {
        const result = CrimeTypeMapper.enumToDisplayName(testCase.input)
        const passed = result === testCase.expectedDisplay
        this.addResult(
          `Case insensitive enum: ${testCase.input}`,
          passed,
          passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expectedDisplay}", got "${result}"`
        )
      }

      if ('expectedEnum' in testCase) {
        const result = CrimeTypeMapper.displayNameToEnum(testCase.input)
        const passed = result === testCase.expectedEnum
        this.addResult(
          `Case insensitive display: ${testCase.input}`,
          passed,
          passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expectedEnum}", got "${result}"`
        )
      }
    }
  }

  private testInvalidInputs() {
    const invalidInputs = ['', null, undefined, 'nonExistentCrimeType', '   ', '123']
    
    for (const input of invalidInputs) {
      const enumResult = CrimeTypeMapper.enumToDisplayName(input as string)
      const displayResult = CrimeTypeMapper.displayNameToEnum(input as string)
      
      const passed = enumResult === null && displayResult === null
      this.addResult(
        `Invalid input: "${input}"`,
        passed,
        passed ? 'Correctly returned null' : `Expected null, got enum: "${enumResult}", display: "${displayResult}"`
      )
    }
  }

  private testCategoryMapping() {
    const testCases = [
      { crimeType: 'onlinePredatoryBehavior', expectedCategory: 'Harassment & Exploitation' },
      { crimeType: 'Online Predatory Behavior', expectedCategory: 'Harassment & Exploitation' },
      { crimeType: 'phishing', expectedCategory: 'Communication & Social Media Crimes' },
      { crimeType: 'Phishing', expectedCategory: 'Communication & Social Media Crimes' },
      { crimeType: 'ransomware', expectedCategory: 'Malware & System Attacks' }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.getCategory(testCase.crimeType)
      const passed = result === testCase.expectedCategory
      this.addResult(
        `Category mapping: ${testCase.crimeType}`,
        passed,
        passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expectedCategory}", got "${result}"`
      )
    }
  }

  private testUnitMapping() {
    const testCases = [
      { crimeType: 'onlinePredatoryBehavior', expectedUnit: 'Cyber Crime Against Women and Children' },
      { crimeType: 'phishing', expectedUnit: 'Cyber Crime Investigation Cell' },
      { crimeType: 'identityTheft', expectedUnit: 'Cyber Security Division' },
      { crimeType: 'denialOfServiceAttacks', expectedUnit: 'Critical Infrastructure Protection Unit' },
      { crimeType: 'advancedPersistentThreats', expectedUnit: 'Special Cyber Operations Unit' }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.getAssignedUnit(testCase.crimeType)
      const passed = result === testCase.expectedUnit
      this.addResult(
        `Unit mapping: ${testCase.crimeType}`,
        passed,
        passed ? `Correctly mapped to "${result}"` : `Expected "${testCase.expectedUnit}", got "${result}"`
      )
    }
  }

  private testNormalizationFunction() {
    const testCases = [
      { input: 'onlinePredatoryBehavior', expected: 'Online Predatory Behavior' },
      { input: 'Online Predatory Behavior', expected: 'Online Predatory Behavior' },
      { input: 'cyberbullying', expected: 'Cyberbullying' },
      { input: 'Cyberbullying', expected: 'Cyberbullying' },
      { input: 'PHISHING', expected: 'Phishing' },
      { input: 'nonExistent', expected: null }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.normalizeForDatabase(testCase.input)
      const passed = result === testCase.expected
      this.addResult(
        `Normalization: ${testCase.input}`,
        passed,
        passed ? `Correctly normalized to "${result}"` : `Expected "${testCase.expected}", got "${result}"`
      )
    }
  }

  private testPotentialMatches() {
    const testCases = [
      { input: 'predatory', shouldFindMatches: true },
      { input: 'bullying', shouldFindMatches: true },
      { input: 'phish', shouldFindMatches: true },
      { input: 'xyz123', shouldFindMatches: false }
    ]

    for (const testCase of testCases) {
      const result = CrimeTypeMapper.findPotentialMatches(testCase.input)
      const passed = testCase.shouldFindMatches ? result.length > 0 : result.length === 0
      this.addResult(
        `Potential matches: ${testCase.input}`,
        passed,
        passed ? `Correctly found ${result.length} matches` : `Expected ${testCase.shouldFindMatches ? 'matches' : 'no matches'}, got ${result.length}`
      )
    }
  }

  private testProblematicCases() {
    // These are the specific cases mentioned in the issue
    const problematicCases = [
      'onlinePredatoryBehavior',
      'cyberbullying',
      'businessEmailCompromise',
      'denialOfServiceAttacks',
      'advancedPersistentThreats'
    ]

    for (const crimeType of problematicCases) {
      const displayName = CrimeTypeMapper.enumToDisplayName(crimeType)
      const category = CrimeTypeMapper.getCategory(crimeType)
      const unit = CrimeTypeMapper.getAssignedUnit(crimeType)
      const isValid = CrimeTypeMapper.isValidCrimeType(crimeType)

      const passed = displayName !== null && category !== null && unit !== null && isValid
      this.addResult(
        `Problematic case: ${crimeType}`,
        passed,
        passed 
          ? `All mappings found: display="${displayName}", category="${category}", unit="${unit}"` 
          : `Missing mappings: display=${displayName}, category=${category}, unit=${unit}, valid=${isValid}`
      )
    }
  }

  private testAllMappingsExist() {
    const allMappings = CrimeTypeMapper.getAllMappings()
    const expectedCount = 67 // Based on the comment in the issue
    
    const passed = allMappings.length >= expectedCount
    this.addResult(
      'All mappings exist',
      passed,
      `Found ${allMappings.length} mappings (expected at least ${expectedCount})`
    )

    // Test that each mapping has all required fields
    let invalidMappings = 0
    for (const mapping of allMappings) {
      if (!mapping.enumName || !mapping.displayName || !mapping.category || !mapping.unit) {
        invalidMappings++
      }
    }

    const allValid = invalidMappings === 0
    this.addResult(
      'All mappings complete',
      allValid,
      allValid ? 'All mappings have required fields' : `${invalidMappings} mappings missing required fields`
    )
  }

  private testDatabaseCompatibility() {
    // Test that our mappings match what's expected in the database
    const databaseCrimeTypes = [
      'Online Predatory Behavior',
      'Cyberbullying', 
      'Phishing',
      'Business Email Compromise',
      'SMS Fraud',
      'Denial of Service Attacks',
      'Advanced Persistent Threats'
    ]

    for (const dbCrimeType of databaseCrimeTypes) {
      const enumName = CrimeTypeMapper.displayNameToEnum(dbCrimeType)
      const backToDisplay = enumName ? CrimeTypeMapper.enumToDisplayName(enumName) : null

      const passed = backToDisplay === dbCrimeType
      this.addResult(
        `Database compatibility: ${dbCrimeType}`,
        passed,
        passed 
          ? `Round-trip successful via enum "${enumName}"` 
          : `Round-trip failed: enum="${enumName}", back="${backToDisplay}"`
      )
    }
  }

  /**
   * Test a specific crime type and log detailed results
   */
  public testSpecificCrimeType(crimeType: string): any {
    console.log(`🔍 Testing specific crime type: "${crimeType}"`)
    
    const results = {
      input: crimeType,
      enumToDisplay: CrimeTypeMapper.enumToDisplayName(crimeType),
      displayToEnum: CrimeTypeMapper.displayNameToEnum(crimeType),
      category: CrimeTypeMapper.getCategory(crimeType),
      unit: CrimeTypeMapper.getAssignedUnit(crimeType),
      isValid: CrimeTypeMapper.isValidCrimeType(crimeType),
      normalized: CrimeTypeMapper.normalizeForDatabase(crimeType),
      potentialMatches: CrimeTypeMapper.findPotentialMatches(crimeType),
      fullMapping: CrimeTypeMapper.getMappingByEnum(crimeType) || CrimeTypeMapper.getMappingByDisplayName(crimeType)
    }

    console.log('Results:', JSON.stringify(results, null, 2))
    return results
  }
}

// Export a ready-to-use instance
export const crimeTypeMappingTests = new CrimeTypeMappingTests()

// Export individual test functions for use in components or other files
export const runCrimeTypeMappingTests = () => crimeTypeMappingTests.runAllTests()
export const testSpecificCrimeType = (crimeType: string) => crimeTypeMappingTests.testSpecificCrimeType(crimeType)

// For debugging - log test results when this file is imported
if (typeof window !== 'undefined') {
  console.log('🧪 Crime Type Mapping Tests available. Run runCrimeTypeMappingTests() to execute.')
}