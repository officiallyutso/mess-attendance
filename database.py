from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt

class Database:
    def __init__(self, uri):
        self.client = MongoClient(uri)
        self.db = self.client.mess_attendance
        
    def save_attendance(self, attendance_data):
        self.db.attendance.insert_many(attendance_data)
    
    def get_attendance(self, start_date=None, end_date=None):
        query = {}
        if start_date and end_date:
            query['date'] = {
                '$gte': start_date,
                '$lte': end_date
            }
        return list(self.db.attendance.find(query, {'_id': 0}))
    
    
    def get_consecutive_absences(self, start_date, end_date, consecutive_days=3):
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        records = self.db.attendance.find({
            'date': {'$gte': start, '$lte': end},
            'status': 'absent'
        })
        
        absent_days = {}
        for record in records:
            enrollment = record['enrollment']
            if enrollment not in absent_days:
                absent_days[enrollment] = []
            absent_days[enrollment].append(record['date'])
        
        consecutive_absences = []
        for enrollment, dates in absent_days.items():
            dates.sort()
            consecutive = 1
            start_date = dates[0]
            
            for i in range(1, len(dates)):
                if (dates[i] - dates[i-1]).days == 1:
                    consecutive += 1
                else:
                    if consecutive >= consecutive_days:
                        consecutive_absences.append({
                            'enrollment': enrollment,
                            'start_date': start_date,
                            'end_date': dates[i-1],
                            'days': consecutive
                        })
                    consecutive = 1
                    start_date = dates[i]
            
            if consecutive >= consecutive_days:
                consecutive_absences.append({
                    'enrollment': enrollment,
                    'start_date': start_date,
                    'end_date': dates[-1],
                    'days': consecutive
                })
        
        return consecutive_absences
    
    def get_admin(self, username):
        return self.db.admins.find_one({'username': username})