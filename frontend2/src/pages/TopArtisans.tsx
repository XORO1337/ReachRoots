import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, MapPin, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ArtisanService, { ArtisanProfile } from '../services/artisanService';

const rankBadges = ['#1', '#2', '#3', '#4', '#5'];

const TopArtisans: React.FC = () => {
  const { t } = useTranslation();
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArtisans = async () => {
      try {
        setLoading(true);
        setError(null);
        const topArtisans = await ArtisanService.getTopArtisans(5);
        setArtisans(topArtisans);
        if (topArtisans.length === 0) {
          setError(t('topArtisans.noHighlights'));
        }
      } catch (err) {
        setError(t('topArtisans.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadArtisans();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-16 px-4" id="top-artisans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-2 self-center bg-white shadow-sm px-4 py-2 rounded-full text-orange-600 font-medium">
            <Users className="h-4 w-4" />
            {t('topArtisans.meetOurArtisans')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">{t('topArtisans.title')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('topArtisans.description')}
          </p>
          <div className="flex justify-center gap-4 text-sm text-orange-700 font-semibold">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" /> {t('topArtisans.curatedSelection')}
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" /> {t('topArtisans.consistentQuality')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t('topArtisans.diverseRegions')}
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-6" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-orange-200 rounded-2xl p-8 text-center text-orange-700 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2">
            {artisans.slice(0, 5).map((artisan, index) => (
              <article key={artisan._id || index} className="bg-white rounded-2xl shadow-sm p-6 border border-orange-100 hover:border-orange-200 transition">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-orange-500 font-semibold">{t('topArtisans.featuredArtisan')}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{artisan.userId?.name || t('topArtisans.artisan')}</h2>
                  </div>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-600 font-semibold">
                    {rankBadges[index] || `#${index + 1}`}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {artisan.bio || t('topArtisans.defaultBio')}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {artisan.region || t('topArtisans.regionUnavailable')}
                  </span>
                  {artisan.userId?.email && (
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      {artisan.userId.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {artisan.skills && artisan.skills.length > 0 ? (
                    artisan.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-orange-50 text-orange-700">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-500">
                      {t('topArtisans.skillsPendingUpdate')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-orange-200 rounded-xl text-orange-700 hover:bg-orange-50 transition"
          >
            ← {t('topArtisans.backToMarketplace')}
          </Link>
          <p className="text-sm text-gray-500">
            {t('topArtisans.rankingsNote')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopArtisans;
