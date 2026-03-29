import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import type { MeetingMinutes } from '@/types/minutes'
import type { Meeting } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: '#1f2937' },
  header: { marginBottom: 12 },
  title: { fontSize: 16, marginBottom: 4, color: '#18325A' },
  sectionTitle: { fontSize: 13, marginTop: 10, marginBottom: 4, color: '#18325A' },
  row: { marginBottom: 4 },
  bold: { fontWeight: 700 },
})

export async function generateMeetingPDF(minutes: MeetingMinutes, meeting: Meeting): Promise<Blob> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>HUSFELAG - HOLTSGATA 24</Text>
          <Text>Fundargerð</Text>
          <Text>{meeting.title}</Text>
          <Text>{new Date(meeting.meeting_date).toLocaleString('is-IS')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mætingarlisti</Text>
        {minutes.attendees.map((a) => (
          <Text key={a.user_id} style={styles.row}>
            {a.attended ? '✓' : '◻'} {a.name} ({a.apartment})
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Dagskrá</Text>
        {minutes.agenda_items.map((item, idx) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <Text style={styles.bold}>
              {idx + 1}. {item.title}
            </Text>
            <Text>Ákvörðun: {item.decision || '—'}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Aðrar athugasemdir</Text>
        <Text>{minutes.other_notes || '—'}</Text>

        <Text style={styles.sectionTitle}>Undirritun</Text>
        <Text>Fundarritari: {minutes.secretary_id ?? '—'}</Text>
        <Text>Fundarstjóri: {minutes.chair_id ?? '—'}</Text>
      </Page>
    </Document>
  )

  return await pdf(doc).toBlob()
}

