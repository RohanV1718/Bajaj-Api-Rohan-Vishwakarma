import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5000}`;

const runApiTests = async () => {
  console.log('🚀 Starting DeskFlow API Integration Tests...\n');
  let testTicketId = null;

  try {
    // 1. Fetch initial tickets and stats
    console.log('📋 Step 1: Getting current stats...');
    const statsRes = await fetch(`${API_URL}/tickets/stats`);
    const statsData = await statsRes.json();
    console.log('✅ Stats fetched successfully:', statsData.data || statsData);

    // 2. Create a ticket
    console.log('\n➕ Step 2: Creating a new ticket...');
    const createRes = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'API Test Ticket',
        description: 'Verifying endpoints',
        customerEmail: 'api-tester@example.com',
        priority: 'high',
      }),
    });
    
    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create ticket: ${errText}`);
    }
    const createData = await createRes.json();
    const ticket = createData.data || createData;
    testTicketId = ticket._id;
    console.log(`✅ Ticket created successfully! ID: ${testTicketId}, Status: ${ticket.status}, Priority: ${ticket.priority}`);

    // 3. Test Invalid status transition: open -> resolved (should fail with 400)
    console.log('\n🚫 Step 3: Testing invalid status transition (open -> resolved)...');
    const invalidTransitionRes = await fetch(`${API_URL}/tickets/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    
    console.log(`Status code received: ${invalidTransitionRes.status}`);
    const invalidTransitionData = await invalidTransitionRes.json();
    if (invalidTransitionRes.status === 400) {
      console.log('✅ Correctly blocked invalid transition! Message:', invalidTransitionData.message || invalidTransitionData.error);
    } else {
      throw new Error(`Expected status 400 for invalid transition, got ${invalidTransitionRes.status}`);
    }

    // 4. Test Valid status transition: open -> in_progress
    console.log('\n🔄 Step 4: Testing valid status transition (open -> in_progress)...');
    const validTransitionRes1 = await fetch(`${API_URL}/tickets/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });

    if (!validTransitionRes1.ok) {
      const errText = await validTransitionRes1.text();
      throw new Error(`Failed to update to in_progress: ${errText}`);
    }
    const validTransitionData1 = await validTransitionRes1.json();
    const updatedTicket1 = validTransitionData1.data || validTransitionData1;
    console.log(`✅ Updated successfully! New Status: ${updatedTicket1.status}`);

    // 5. Test Valid status transition: in_progress -> resolved
    console.log('\n🔄 Step 5: Testing valid status transition (in_progress -> resolved)...');
    const validTransitionRes2 = await fetch(`${API_URL}/tickets/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });

    if (!validTransitionRes2.ok) {
      const errText = await validTransitionRes2.text();
      throw new Error(`Failed to update to resolved: ${errText}`);
    }
    const validTransitionData2 = await validTransitionRes2.json();
    const updatedTicket2 = validTransitionData2.data || validTransitionData2;
    console.log(`✅ Updated successfully! New Status: ${updatedTicket2.status}, ResolvedAt: ${updatedTicket2.resolvedAt}`);

    // 6. Test valid transition backward: resolved -> in_progress (clears resolvedAt)
    console.log('\n🔄 Step 6: Testing backward status transition (resolved -> in_progress)...');
    const backwardTransitionRes = await fetch(`${API_URL}/tickets/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });

    if (!backwardTransitionRes.ok) {
      const errText = await backwardTransitionRes.text();
      throw new Error(`Failed to update backward: ${errText}`);
    }
    const backwardTransitionData = await backwardTransitionRes.json();
    const updatedTicket3 = backwardTransitionData.data || backwardTransitionData;
    console.log(`✅ Updated backward successfully! Status: ${updatedTicket3.status}, ResolvedAt (should be null/undefined): ${updatedTicket3.resolvedAt}`);

    // 7. Cleanup: Delete the ticket
    if (testTicketId) {
      console.log(`\n🗑️ Step 7: Deleting the test ticket (ID: ${testTicketId})...`);
      const deleteRes = await fetch(`${API_URL}/tickets/${testTicketId}`, {
        method: 'DELETE',
      });
      if (deleteRes.ok) {
        console.log('✅ Ticket deleted successfully!');
      } else {
        const errText = await deleteRes.text();
        throw new Error(`Failed to delete ticket: ${errText}`);
      }
    }

    console.log('\n🎉 All integration tests passed successfully! The API is working perfectly.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed with error:', err.message);
    process.exit(1);
  }
};

runApiTests();
