let absencesData = [];

async function fetchAbsences() {
    const startDate = document.getElementById('absenceStartDate').value;
    const endDate = document.getElementById('absenceEndDate').value;
    const consecutiveDays = document.getElementById('consecutiveDays').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    try {
        const response = await fetch(
            `/api/absences?start_date=${startDate}&end_date=${endDate}&consecutive_days=${consecutiveDays}`
        );
        absencesData = await response.json();
        
        if (response.ok) {
            updateAbsencesTable();
        } else {
            alert('Failed to fetch absences data');
        }
    } catch (error) {
        alert('An error occurred while fetching data');
    }
}

function updateAbsencesTable() {
    const tbody = document.querySelector('#absencesTable tbody');
    tbody.innerHTML = '';
    
    if (absencesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No consecutive absences found</td></tr>';
        return;
    }
    
    absencesData.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.enrollment}</td>
            <td>${new Date(record.start_date).toLocaleDateString()}</td>
            <td>${new Date(record.end_date).toLocaleDateString()}</td>
            <td>${record.days}</td>
        `;
        tbody.appendChild(tr);
    });
}

function downloadReport() {
    if (absencesData.length === 0) {
        alert('No data to download');
        return;
    }
    
    const headers = ['Enrollment', 'Start Date', 'End Date', 'Days Absent'];
    const csv = [
        headers.join(','),
        ...absencesData.map(record => [
            record.enrollment,
            new Date(record.start_date).toLocaleDateString(),
            new Date(record.end_date).toLocaleDateString(),
            record.days
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'absences_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initialize with current month's date range
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('absenceStartDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('absenceEndDate').value = lastDay.toISOString().split('T')[0];
});