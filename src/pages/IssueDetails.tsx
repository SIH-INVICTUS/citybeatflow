import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { apiGet } from '@/lib/api';
import IssuesMap from '@/components/civic/IssuesMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<any | null>(null);

  const role = (localStorage.getItem('auth_role') as any) as 'citizen' | 'ngo' | 'admin' | null;
  const userType = role || 'citizen';

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await apiGet(`/api/issues/${id}`);
        setIssue(data);
      } catch (err) {
        // ignore
      }
    })();
  }, [id]);

  if (!issue) {
    return (
    <div className="min-h-screen bg-background">
        <Header userType={userType} />
        <div className="container py-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} />
      <div className="container py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{issue.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Reported by {issue.reportedBy || issue.reporterEmail || 'anonymous'}</p>
            <p className="mt-2">{issue.description}</p>
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {issue.attachments.map((a: any, idx: number) => (
                  <div key={a.filename || idx} className="aspect-video bg-muted rounded overflow-hidden">
                    {/* If attachment has url, show it; otherwise show filename placeholder */}
                    {a.url ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img src={a.url} alt={`attachment-${idx}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">{a.filename}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload attachment (visible to NGO/admin) */}
            {(userType === 'ngo' || userType === 'admin') && (
              <div className="mt-4">
                <label className="block text-sm mb-2">Add Attachment</label>
                <input type="file" onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  try {
                    const res = await fetch(`/api/issues/${issue._id}/attachments`, {
                      method: 'POST',
                      body: form,
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setIssue(updated);
                    } else {
                      console.warn('Upload failed');
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }} />
              </div>
            )}

            <div className="h-64 mt-4 rounded overflow-hidden">
              <IssuesMap issues={[issue]} center={issue.location && issue.location.lat && issue.location.lng ? { lat: issue.location.lat, lng: issue.location.lng } : undefined} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Updates</h3>
              <ul className="mt-2 space-y-2">
                {(issue.statusHistory || []).map((s: any, i: number) => (
                  <li key={`${s.status}-${i}`} className="text-sm text-muted-foreground">{s.status} — {new Date(s.date).toLocaleString()} ({s.by})</li>
                ))}
                {(issue.updates || []).map((u: any, i: number) => (
                  <li key={`u-${i}`} className="text-sm">{u.text} — {new Date(u.date).toLocaleString()} ({u.by})</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssueDetails;
