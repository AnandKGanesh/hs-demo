# Agent Guidelines for Hyperswitch Demo App

## CRITICAL RULE: Regression Testing Checklist

**BEFORE declaring any task complete, you MUST:**

### 1. Backup Current Working State
- Create backup: `cp -r /path/to/app /path/to/app-v{N}`
- Document what version N contains

### 2. Identify All Affected Flows
When adding/modifying a flow, list ALL existing flows that could be impacted:
- Check Sidebar.js for all flow categories
- Check App.js for all route mappings
- Check server.js for all API endpoints

### 3. Regression Testing Checklist
**Test these flows after ANY change:**

#### Payment Flows
- [ ] Automatic Capture
- [ ] Manual Capture
- [ ] Manual Partial Capture
- [ ] Repeat User

#### Recurring Flows
- [ ] $0 Setup Recurring
- [ ] Setup Recurring and Charge
- [ ] Recurring Charge
- [ ] Recurring Charge with Network Transaction ID
- [ ] Recurring Charge with PSP Token

#### 3DS Flows
- [ ] Authenticate with 3DS via PSP
- [ ] Import 3D Secure Results
- [ ] Standalone 3D Secure

#### FRM Flows
- [ ] FRM Pre-Auth

#### Relay Flows
- [ ] Relay - Capture
- [ ] Relay - Refund
- [ ] Relay - Void
- [ ] Relay - Incremental Auth

### 4. Testing Commands
```bash
# Restart server
pkill -f "node server.js"
node server.js > server.log 2>&1 &

# Test an endpoint
curl -s http://localhost:5252/api/payment/test123

# Check server logs
tail -f server.log
```

### 5. What to Check
- All API endpoints respond with JSON (not HTML error pages)
- No "Cannot POST" or "Cannot GET" errors
- Existing flows still load in UI
- Server starts without errors
- No duplicate endpoint definitions

### 6. If Something Breaks
1. STOP immediately
2. Check what was removed/modified
3. Restore from backup if needed
4. Fix the issue
5. Re-run full regression test

## NEVER
- Declare task complete without testing existing flows
- Assume "it should work" without verification
- Skip testing because "I only changed X"

## ALWAYS
- Test the new flow
- Test 2-3 existing flows minimum
- Document what was tested
- Create backup before major changes
- **Keep FLOW_MAPPINGS_V2.md updated after every new implementation or change in existing implementation**
- **Reference Postman collection and API docs to identify the correct flow structure before building**
- **Verify payload structure matches official documentation before shipping**
