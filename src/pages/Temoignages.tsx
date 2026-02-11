import { useEffect, useState } from 'react';
import { messagesApi, Testimonial } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export function Temoignages() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await messagesApi.getTestimonials();
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-center">
          Témoignages
        </h1>

        <p className="text-xl text-center text-black/70 mb-16">
          Ils se sont trouvés. Et si c'était votre tour ? Des récits sincères,
          touchants et inspirants témoignent de la magie de nos rencontres et de
          l'accompagnement que nous proposons.
        </p>

        {testimonials.length === 0 ? (
          <div className="text-center text-black/60 py-12">
            <p>Les premiers témoignages arrivent bientôt.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="border-black/10 shadow-none"
              >
                <CardContent className="p-8">
                  <p className="text-lg text-black/80 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <p className="text-sm font-medium">— {testimonial.authorName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
