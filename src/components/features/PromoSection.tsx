import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Clock, Zap } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { promoItems } from "@/data/mockData";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

const PromoSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 12,
  });

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header with enhanced typography */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              Offres Flash
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent mb-4">
            Promotions Exceptionnelles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profitez de nos meilleures offres avec des réductions jusqu'à 70%
            sur une sélection de produits premium
          </p>
        </div>

        <div className="relative">
          <div
            className="overflow-hidden rounded-2xl shadow-2xl"
            ref={emblaRef}
          >
            <div className="flex -ml-6">
              {promoItems.map((item) => (
                <div key={item.id} className="flex-[0_0_100%] pl-6">
                  <div className="relative overflow-hidden h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200">
                    {/* Image container with overlay */}
                    <div className="absolute inset-0 z-0">
                      <FallbackImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/50 to-gray-900/20"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center">
                      <div className="w-full max-w-4xl mx-auto px-8 md:px-16">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                          {/* Left side - Main content */}
                          <div className="text-white">
                            {/* Badges */}
                            <div className="flex items-center gap-3 mb-6">
                              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                -{item.discount} OFF
                              </Badge>
                              {item.isLimitedTime && (
                                <div className="flex items-center gap-1 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  <Clock className="w-3 h-3" />
                                  FLASH
                                </div>
                              )}
                            </div>

                            {/* Title and subtitle */}
                            <h3 className="text-5xl md:text-6xl font-bold mb-3 leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                              {item.subtitle}
                            </p>

                            {/* Social proof */}
                            <div className="flex items-center gap-4 mb-8">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold">
                                  {item.rating}
                                </span>
                                <span className="text-xs text-gray-300">
                                  ({item.soldCount} vendus)
                                </span>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <Button
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                              onClick={() =>
                                item.categoryId &&
                                (window.location.href = `/catalog?category=${item.categoryId}`)
                              }
                            >
                              {item.cta}
                            </Button>
                          </div>

                          {/* Right side - Price card */}
                          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-600 mb-2">
                                Prix spécial
                              </div>

                              {/* Prices */}
                              <div className="mb-4">
                                <div className="text-3xl font-bold text-orange-600 mb-1">
                                  {item.salePrice}
                                </div>
                                <div className="text-lg text-gray-500 line-through">
                                  {item.originalPrice}
                                </div>
                              </div>

                              {/* Countdown timer for limited time offers */}
                              {item.isLimitedTime && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                  <div className="text-xs font-semibold text-gray-600 mb-2">
                                    Se termine dans:
                                  </div>
                                  <div className="flex justify-center gap-2">
                                    <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold min-w-[2rem]">
                                      {timeLeft.hours
                                        .toString()
                                        .padStart(2, "0")}
                                    </div>
                                    <span className="text-gray-600">:</span>
                                    <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold min-w-[2rem]">
                                      {timeLeft.minutes
                                        .toString()
                                        .padStart(2, "0")}
                                    </div>
                                    <span className="text-gray-600">:</span>
                                    <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold min-w-[2rem]">
                                      {timeLeft.seconds
                                        .toString()
                                        .padStart(2, "0")}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    h : m : s
                                  </div>
                                </div>
                              )}

                              {/* Savings highlight */}
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                                <div className="text-sm font-semibold text-green-800">
                                  Économisez{" "}
                                  {parseInt(
                                    item.originalPrice?.replace(
                                      /[^0-9]/g,
                                      ""
                                    ) || "0"
                                  ) -
                                    parseInt(
                                      item.salePrice?.replace(/[^0-9]/g, "") ||
                                        "0"
                                    )}
                                  FCFA
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-xl border border-gray-200 transition-all duration-300 hover:scale-110"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-xl border border-gray-200 transition-all duration-300 hover:scale-110"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Enhanced pagination dots */}
          <div className="flex justify-center mt-8 gap-3">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === selectedIndex
                    ? "bg-primary w-8 h-3 shadow-lg"
                    : "bg-gray-300 hover:bg-gray-400 w-3 h-3"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Livraison gratuite
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Garantie 2 ans
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Paiement sécurisé
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Support 24/7
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
