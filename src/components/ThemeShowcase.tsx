import { Link } from "react-router-dom";
import { themes } from "@/data/mockListings";
import { cn } from "@/lib/utils";

const themeImages: Record<string, string> = {
  christmas: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=600',
  diwali: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600',
  halloween: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=600',
  eid: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=600',
  hanukkah: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=600',
  other: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=600',
};

export function ThemeShowcase() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Explore by Theme
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From Christmas wonderlands to Diwali celebrations, find displays that match your festive spirit.
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {themes.map((theme) => (
            <Link
              key={theme.value}
              to={`/browse?theme=${theme.value}`}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden",
                "border border-border hover:border-primary/50 transition-all duration-300"
              )}
            >
              {/* Background Image */}
              <img
                src={themeImages[theme.value]}
                alt={theme.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                <span className="text-3xl mb-1">{theme.emoji}</span>
                <span className="font-display font-semibold text-sm group-hover:text-primary transition-colors">
                  {theme.label}
                </span>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-primary/10" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
