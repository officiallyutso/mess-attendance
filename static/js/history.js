let attendanceData = [];

async function fetchHistory() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    try {
        console.log('Fetching data for date range:', startDate, 'to', endDate);
        
        const response = await fetch(`/api/attendance?start_date=${startDate}&end_date=${endDate}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (Array.isArray(data)) {
            attendanceData = data;
            updateHistoryTable();
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Invalid data format received');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data: ' + error.message);
    }
}

function updateHistoryTable() {
    console.log('Updating table with data:', attendanceData);
    
    const table = document.getElementById('historyTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Enrollment</th>';
    tbody.innerHTML = '';
    
    if (!attendanceData || attendanceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2">No data available for selected date range</td></tr>';
        return;
    }
    
    const dates = [...new Set(attendanceData.map(record => {
        const date = record.date ? (record.date.includes('T') ? 
            record.date.split('T')[0] : 
            record.date) : null;
        return date;
    }))].filter(date => date !== null).sort();
    
    const enrollments = [...new Set(attendanceData.map(record => record.enrollment))]
        .filter(enrollment => enrollment && enrollment.trim() !== '')
        .sort((a, b) => a.localeCompare(b));
    
    console.log('Unique dates:', dates);
    console.log('Unique enrollments:', enrollments);
    
    dates.forEach(date => {
        const th = document.createElement('th');
        th.textContent = new Date(date).toLocaleDateString();
        thead.appendChild(th);
    });
    
    enrollments.forEach(enrollment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${enrollment}</td>`;
        
        dates.forEach(date => {
            const record = attendanceData.find(r => {
                if (!r || !r.date) return false;
                const recordDate = r.date.includes('T') ? 
                    r.date.split('T')[0] : 
                    r.date;
                return r.enrollment === enrollment && recordDate === date;
            });
            
            const td = document.createElement('td');
            const status = record?.status || '-';
            td.textContent = status;
            if (status && status !== '-') {
                td.className = status.toLowerCase();
            }
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// Initialize with current month's date range
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];
    
    console.log('Initial date range:', firstDay.toISOString().split('T')[0], 'to', lastDay.toISOString().split('T')[0]);
    fetchHistory();
});