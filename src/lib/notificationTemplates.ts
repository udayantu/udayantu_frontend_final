import type { NotificationTemplate } from '@/types/notifications';

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'otp_verification',
    name: 'OTP Verification',
    channel: 'sms',
    body: {
      en: 'Your UdaYantu code is {otp}. Valid for 10 min. Do not share.',
      hi: 'आपका UdaYantu कोड {otp} है। 10 मिनट तक वैध। किसी से शेयर न करें।'
    },
    variables: ['otp'],
    lowBandwidth: true
  },
  {
    id: 'candidate_ready_ss_to_cs',
    name: 'Candidate Ready - SS to CS',
    channel: 'whatsapp',
    body: {
      en: '*New Candidate Ready*\n\nStudent: {studentName}\nReadiness: {readinessScore}%\nAttendance: {attendance}%\n\nScores: {assessmentSummary}\n\nMentor says: {mentorRecommendation}\n\nView packet: {packetLink}',
      hi: '*नया कैंडिडेट तैयार*\n\nस्टूडेंट: {studentName}\nतैयारी: {readinessScore}%\nहाज़िरी: {attendance}%\n\nस्कोर: {assessmentSummary}\n\nमेंटर की राय: {mentorRecommendation}\n\nपैकेट देखें: {packetLink}'
    },
    variables: ['studentName', 'readinessScore', 'attendance', 'assessmentSummary', 'mentorRecommendation', 'packetLink'],
    lowBandwidth: true
  },
  {
    id: 'candidate_ready_admin_summary',
    name: 'Candidate Ready - Admin Summary',
    channel: 'in_app',
    subject: {
      en: 'New candidate ready for placement',
      hi: 'नया कैंडिडेट प्लेसमेंट के लिए तैयार'
    },
    body: {
      en: '{studentName} (Score: {readinessScore}%) is ready for employer matching. SS: {ssName}.',
      hi: '{studentName} (स्कोर: {readinessScore}%) एम्प्लॉयर मैचिंग के लिए तैयार। SS: {ssName}।'
    },
    variables: ['studentName', 'readinessScore', 'ssName'],
    lowBandwidth: true
  },
  {
    id: 'interview_scheduled_student',
    name: 'Interview Scheduled - Student',
    channel: 'whatsapp',
    body: {
      en: '*Interview Scheduled*\n\nCompany: {companyName}\nDate: {date}\nTime: {time}\nMode: {mode}\n\nPrepare well! Your SS will call before the interview.\n\nQuestions? Reply here.',
      hi: '*इंटरव्यू तय हुआ*\n\nकंपनी: {companyName}\nतारीख: {date}\nसमय: {time}\nमोड: {mode}\n\nअच्छे से तैयारी करें! इंटरव्यू से पहले SS आपको कॉल करेंगे।\n\nकोई सवाल? यहाँ रिप्लाई करें।'
    },
    variables: ['companyName', 'date', 'time', 'mode'],
    lowBandwidth: true
  },
  {
    id: 'interview_reminder_student',
    name: 'Interview Reminder - Student',
    channel: 'whatsapp',
    body: {
      en: '*Reminder: Interview Tomorrow*\n\n{companyName}\n{date} at {time}\n\nChecklist:\n✓ Resume ready\n✓ ID proof\n✓ Dress formal\n✓ Join 10 min early\n\nAll the best!',
      hi: '*याद दिलाएं: कल इंटरव्यू*\n\n{companyName}\n{date} को {time} बजे\n\nचेकलिस्ट:\n✓ रिज़्यूमे तैयार\n✓ ID प्रूफ\n✓ फॉर्मल ड्रेस\n✓ 10 मिनट पहले जॉइन करें\n\nशुभकामनाएं!'
    },
    variables: ['companyName', 'date', 'time'],
    lowBandwidth: true
  },
  {
    id: 'interview_outcome_cs_to_ss',
    name: 'Interview Outcome - CS to SS',
    channel: 'whatsapp',
    body: {
      en: '*Interview Result*\n\nStudent: {studentName}\nCompany: {companyName}\nResult: {outcome}\n\nFeedback:\nTech: {techScore}/10\nComm: {commScore}/10\n\nNext: {nextSteps}\n\nReskill: {reskillTags}\n\nView details: {packetLink}',
      hi: '*इंटरव्यू रिज़ल्ट*\n\nस्टूडेंट: {studentName}\nकंपनी: {companyName}\nपरिणाम: {outcome}\n\nफीडबैक:\nटेक: {techScore}/10\nकम्युनिकेशन: {commScore}/10\n\nअगला कदम: {nextSteps}\n\nरीस्किल: {reskillTags}\n\nडिटेल देखें: {packetLink}'
    },
    variables: ['studentName', 'companyName', 'outcome', 'techScore', 'commScore', 'nextSteps', 'reskillTags', 'packetLink'],
    lowBandwidth: true
  },
  {
    id: 'interview_outcome_admin_summary',
    name: 'Interview Outcome - Admin Summary',
    channel: 'in_app',
    subject: {
      en: 'Interview completed: {studentName} at {companyName}',
      hi: 'इंटरव्यू पूरा: {studentName} - {companyName}'
    },
    body: {
      en: 'Result: {outcome}. Overall: {overallScore}/10. CS: {csName}.',
      hi: 'परिणाम: {outcome}। कुल: {overallScore}/10। CS: {csName}।'
    },
    variables: ['studentName', 'companyName', 'outcome', 'overallScore', 'csName'],
    lowBandwidth: true
  },
  {
    id: 'assessment_result_content_to_ss',
    name: 'Assessment Result - Content to SS',
    channel: 'in_app',
    subject: {
      en: 'Assessment completed: {studentName}',
      hi: 'असेसमेंट पूरा: {studentName}'
    },
    body: {
      en: '*Assessment Result*\n\nStudent: {studentName}\nTest: {assessmentName}\nScore: {score}%\nStatus: {status}\n\nFlags: {flags}\n\nPractice plan ready. View: {packetLink}',
      hi: '*असेसमेंट रिज़ल्ट*\n\nस्टूडेंट: {studentName}\nटेस्ट: {assessmentName}\nस्कोर: {score}%\nस्टेटस: {status}\n\nफ्लैग: {flags}\n\nप्रैक्टिस प्लान तैयार। देखें: {packetLink}'
    },
    variables: ['studentName', 'assessmentName', 'score', 'status', 'flags', 'packetLink'],
    lowBandwidth: true
  },
  {
    id: 'student_message_to_ss',
    name: 'Student Message to SS',
    channel: 'whatsapp',
    body: {
      en: '*Student Query*\n\nFrom: {studentName}\nPhone: {studentPhone}\n\nMessage:\n{message}\n\nReply via dashboard.',
      hi: '*स्टूडेंट का सवाल*\n\nनाम: {studentName}\nफोन: {studentPhone}\n\nमैसेज:\n{message}\n\nडैशबोर्ड से जवाब दें।'
    },
    variables: ['studentName', 'studentPhone', 'message'],
    lowBandwidth: true
  },
  {
    id: 'employer_message_to_cs',
    name: 'Employer Message to CS',
    channel: 'email',
    subject: {
      en: '[UdaYantu] Message from {companyName}',
      hi: '[UdaYantu] {companyName} का संदेश'
    },
    body: {
      en: 'Employer: {employerName}\nCompany: {companyName}\nEmail: {employerEmail}\n\nMessage:\n{message}\n\nRespond via employer dashboard.',
      hi: 'एम्प्लॉयर: {employerName}\nकंपनी: {companyName}\nईमेल: {employerEmail}\n\nसंदेश:\n{message}\n\nएम्प्लॉयर डैशबोर्ड से जवाब दें।'
    },
    variables: ['employerName', 'companyName', 'employerEmail', 'message'],
    lowBandwidth: true
  },
  {
    id: 'offer_received_student',
    name: 'Offer Received - Student',
    channel: 'whatsapp',
    body: {
      en: '*Congratulations! Job Offer*\n\n{companyName} has offered you a position!\n\nRole: {role}\nSalary: ₹{salary} LPA\n\nYour SS will call to explain next steps.\n\nDo NOT contact the company directly.',
      hi: '*बधाई हो! जॉब ऑफर*\n\n{companyName} ने आपको ऑफर दिया है!\n\nरोल: {role}\nसैलरी: ₹{salary} LPA\n\nआपके SS कॉल करेंगे अगले स्टेप्स बताने के लिए।\n\nकंपनी को सीधे कॉन्टैक्ट न करें।'
    },
    variables: ['companyName', 'role', 'salary'],
    lowBandwidth: true
  },
  {
    id: 'offer_accepted_employer',
    name: 'Offer Accepted - Employer',
    channel: 'email',
    subject: {
      en: '[UdaYantu] Offer Accepted by {studentName}',
      hi: '[UdaYantu] {studentName} ने ऑफर स्वीकार किया'
    },
    body: {
      en: 'Great news!\n\n{studentName} has accepted your offer for the {role} position.\n\nNext steps:\n1. Our CS team will coordinate joining formalities\n2. All communication will be through UdaYantu\n\nFor queries, reply to this email.',
      hi: 'बढ़िया खबर!\n\n{studentName} ने {role} पोज़िशन का ऑफर स्वीकार कर लिया।\n\nअगले कदम:\n1. हमारी CS टीम जॉइनिंग फॉर्मलिटीज़ कोऑर्डिनेट करेगी\n2. सारा कम्युनिकेशन UdaYantu के ज़रिए होगा\n\nसवाल के लिए इस ईमेल पर रिप्लाई करें।'
    },
    variables: ['studentName', 'role'],
    lowBandwidth: true
  },
  {
    id: 'payment_reminder_student',
    name: 'Payment Reminder - Student',
    channel: 'whatsapp',
    body: {
      en: '*Payment Reminder*\n\nProgram fee pending: ₹{amount}\nDue: {dueDate}\n\nPay now: {paymentLink}\n\nQuestions? Your SS will help.',
      hi: '*पेमेंट रिमाइंडर*\n\nप्रोग्राम फीस बाकी: ₹{amount}\nतारीख: {dueDate}\n\nअभी भुगतान करें: {paymentLink}\n\nसवाल? आपके SS मदद करेंगे।'
    },
    variables: ['amount', 'dueDate', 'paymentLink'],
    lowBandwidth: true
  },
  {
    id: 'training_session_reminder',
    name: 'Training Session Reminder',
    channel: 'whatsapp',
    body: {
      en: '*Training Tomorrow*\n\nSession: {sessionName}\nTime: {time}\nLink: {meetLink}\n\nBe on time! Attendance is tracked.',
      hi: '*कल ट्रेनिंग*\n\nसेशन: {sessionName}\nसमय: {time}\nलिंक: {meetLink}\n\nसमय पर आएं! हाज़िरी ट्रैक होती है।'
    },
    variables: ['sessionName', 'time', 'meetLink'],
    lowBandwidth: true
  },
  {
    id: 'direct_contact_blocked',
    name: 'Direct Contact Blocked',
    channel: 'in_app',
    subject: {
      en: 'Message not sent - Use official channels',
      hi: 'मैसेज नहीं भेजा गया - आधिकारिक चैनल का उपयोग करें'
    },
    body: {
      en: 'Direct contact between students and employers is not allowed. Please contact your {mediatorRole} for assistance.',
      hi: 'स्टूडेंट और एम्प्लॉयर के बीच सीधा संपर्क अनुमति नहीं है। कृपया सहायता के लिए अपने {mediatorRole} से संपर्क करें।'
    },
    variables: ['mediatorRole'],
    lowBandwidth: true
  },
  {
    id: 'weekly_summary_admin',
    name: 'Weekly Summary - Admin',
    channel: 'email',
    subject: {
      en: '[UdaYantu] Weekly Summary: {weekRange}',
      hi: '[UdaYantu] साप्ताहिक सारांश: {weekRange}'
    },
    body: {
      en: '*Weekly Metrics*\n\nNew registrations: {newStudents}\nInterviews conducted: {interviews}\nOffers made: {offers}\nPlacements: {placements}\n\nPending actions:\n- Candidates ready: {pendingCandidates}\n- Interview outcomes: {pendingOutcomes}\n- Tickets open: {openTickets}\n\nView dashboard for details.',
      hi: '*साप्ताहिक मेट्रिक्स*\n\nनई रजिस्ट्रेशन: {newStudents}\nइंटरव्यू हुए: {interviews}\nऑफर दिए: {offers}\nप्लेसमेंट: {placements}\n\nपेंडिंग एक्शन:\n- कैंडिडेट तैयार: {pendingCandidates}\n- इंटरव्यू रिज़ल्ट: {pendingOutcomes}\n- टिकट खुले: {openTickets}\n\nडिटेल के लिए डैशबोर्ड देखें।'
    },
    variables: ['weekRange', 'newStudents', 'interviews', 'offers', 'placements', 'pendingCandidates', 'pendingOutcomes', 'openTickets'],
    lowBandwidth: true
  }
];

export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(t => t.id === templateId);
}

export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>,
  language: 'en' | 'hi'
): { subject?: string; body: string } {
  let body = template.body[language];
  let subject = template.subject?.[language];

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    body = body.replace(new RegExp(placeholder, 'g'), value);
    if (subject) {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    }
  });

  return { subject, body };
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
