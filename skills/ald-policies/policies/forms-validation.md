# Forms & Validation

**Category 17 - Forms & Validation**

**7 policies** for building robust forms.

## Policy 17.1: Client vs Server Validation

**Level**: MUST

**Rule**: Client validation for UX, server validation for security. NEVER trust client alone.

## Policy 17.2: Form Libraries

**Level**: SHOULD

**Recommended**: React Hook Form (performance, DX)

## Policy 17.3: Error Message Patterns

**Level**: MUST

**Rule**: Specific, actionable messages ("Email must be valid" not "Invalid input")

## Policy 17.4: Field-Level Validation

**Level**: SHOULD

**Rule**: Validate on blur, not every keystroke (better UX)

## Policy 17.5: Form State Management

**Level**: MUST

**Track**: isDirty, isValid, isSubmitting, errors

## Policy 17.6: Submit Handling

**Level**: MUST

**Rule**: Disable button during submission, handle errors gracefully

## Policy 17.7: Accessibility in Forms

**Level**: MUST

**Rule**: Labels, ARIA attributes, error announcements for screen readers

---

**Last Updated**: 2025-10-23
**Category**: 17 - Forms & Validation
**Total Policies**: 7
