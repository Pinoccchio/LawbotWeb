// Test Officer Assignment Fix
// This file tests the officer assignment system with problematic crime types

import CrimeTypeMapper from './crime-type-mapping'
import OfficerAssignmentService from './officer-assignment-service'

interface TestCase {
  crimeType: string
  expectedUnit: string
  description: string
}

/**
 * Test Officer Assignment with Problematic Crime Types
 */
export async function testOfficerAssignment() {
  console.log('🧪 Testing Officer Assignment Fix...')
  
  const problematicCases: TestCase[] = [
    {
      crimeType: 'onlinePredatoryBehavior',
      expectedUnit: 'Cyber Crime Against Women and Children',
      description: 'The main problematic case from the issue'
    },
    {
      crimeType: 'cyberbullying',
      expectedUnit: 'Cyber Crime Against Women and Children', 
      description: 'Case that was supposedly working'
    },
    {
      crimeType: 'phishing',
      expectedUnit: 'Cyber Crime Investigation Cell',
      description: 'Common crime type test'
    },
    {
      crimeType: 'businessEmailCompromise',
      expectedUnit: 'Cyber Crime Investigation Cell',
      description: 'Another camelCase test'
    },
    {
      crimeType: 'denialOfServiceAttacks',
      expectedUnit: 'Critical Infrastructure Protection Unit',
      description: 'System disruption crime test'
    }
  ]

  const results = []

  for (const testCase of problematicCases) {
    console.log(`\n🔍 Testing: ${testCase.crimeType}`)
    console.log(`   Description: ${testCase.description}`)
    console.log(`   Expected Unit: ${testCase.expectedUnit}`)

    // Test the crime type mapping
    const displayName = CrimeTypeMapper.enumToDisplayName(testCase.crimeType)
    const category = CrimeTypeMapper.getCategory(testCase.crimeType)
    const unit = CrimeTypeMapper.getAssignedUnit(testCase.crimeType)
    const normalized = CrimeTypeMapper.normalizeForDatabase(testCase.crimeType)

    console.log('   Mapping Results:', {
      displayName,
      category,
      unit,
      normalized
    })

    const mappingPassed = unit === testCase.expectedUnit
    console.log(`   Mapping Test: ${mappingPassed ? '✅ PASS' : '❌ FAIL'}`)

    // Test officer assignment (without unit_id to test crime type filtering)
    try {
      console.log('   Testing officer assignment...')
      const officers = await OfficerAssignmentService.getAvailableOfficersForAssignment(
        undefined, // No unit_id to force crime type matching
        testCase.crimeType
      )

      console.log(`   Officers Found: ${officers.length}`)
      if (officers.length > 0) {
        console.log(`   Sample Officer: ${officers[0].officer_name} from ${officers[0].unit_name}`)
      }

      const assignmentPassed = officers.length > 0
      console.log(`   Assignment Test: ${assignmentPassed ? '✅ PASS' : '❌ FAIL'}`)

      results.push({
        crimeType: testCase.crimeType,
        mappingPassed,
        assignmentPassed,
        officersFound: officers.length,
        displayName,
        category,
        unit,
        officers: officers.slice(0, 2) // First 2 officers for reference
      })

    } catch (error) {
      console.log(`   Assignment Test: ❌ ERROR - ${error}`)
      results.push({
        crimeType: testCase.crimeType,
        mappingPassed,
        assignmentPassed: false,
        officersFound: 0,
        error: error instanceof Error ? error.message : String(error),
        displayName,
        category,
        unit
      })
    }
  }

  console.log('\n📊 Test Summary:')
  console.log('═'.repeat(60))

  let passedMapping = 0
  let passedAssignment = 0
  
  results.forEach(result => {
    if (result.mappingPassed) passedMapping++
    if (result.assignmentPassed) passedAssignment++
    
    console.log(`${result.crimeType}:`)
    console.log(`  Mapping: ${result.mappingPassed ? '✅' : '❌'} | Assignment: ${result.assignmentPassed ? '✅' : '❌'} | Officers: ${result.officersFound}`)
  })

  console.log('═'.repeat(60))
  console.log(`Mapping Tests: ${passedMapping}/${results.length} passed`)
  console.log(`Assignment Tests: ${passedAssignment}/${results.length} passed`)

  const allPassed = passedMapping === results.length && passedAssignment === results.length
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED!' : '❌ Some tests failed'}`)

  return {
    results,
    summary: {
      totalTests: results.length,
      mappingPassed: passedMapping,
      assignmentPassed: passedAssignment,
      allPassed
    }
  }
}

/**
 * Quick test for a single crime type
 */
export async function testSingleCrimeType(crimeType: string) {
  console.log(`🔍 Quick test for: ${crimeType}`)
  
  // Test mapping
  const mapping = CrimeTypeMapper.getMappingByEnum(crimeType) || CrimeTypeMapper.getMappingByDisplayName(crimeType)
  console.log('Mapping:', mapping)
  
  // Test officer assignment
  try {
    const officers = await OfficerAssignmentService.getAvailableOfficersForAssignment(
      undefined,
      crimeType
    )
    console.log(`Officers found: ${officers.length}`)
    return { mapping, officersFound: officers.length, officers: officers.slice(0, 3) }
  } catch (error) {
    console.error('Assignment error:', error)
    return { mapping, officersFound: 0, error }
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testOfficerAssignment = testOfficerAssignment
  (window as any).testSingleCrimeType = testSingleCrimeType
  console.log('🧪 Officer assignment tests available:')
  console.log('  - testOfficerAssignment()')
  console.log('  - testSingleCrimeType("crimeTypeName")')
}