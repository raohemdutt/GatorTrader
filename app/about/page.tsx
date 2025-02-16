import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">About GatorTrader</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            GatorTrader is dedicated to connecting University of Florida students for seamless trading of goods and
            services. We aim to create a safe, efficient, and user-friendly platform that fosters a sense of community
            among Gators.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sign up for a GatorTrader account using your UF email.</li>
            <li>Browse listings or post your own items for sale.</li>
            <li>Connect with buyers or sellers through our secure messaging system.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Team</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>Hemdutt Rao - Founder</li>
            <li>Jayce Corcoran - Founder</li>
            <li>Blake Coppens - Founder</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Is GatorTrader only for UF students?</h3>
              <p>Yes, currently GatorTrader is exclusively for University of Florida students.</p>
            </div>
            <div>
              <h3 className="font-semibold">How do I report a suspicious listing?</h3>
              <p>
                You can report any suspicious activity by clicking the "Report" button on the listing or contacting our
                support team.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Is there a fee for using GatorTrader?</h3>
              <p>No, GatorTrader is completely free for UF students to use.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

