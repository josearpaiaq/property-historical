import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProperties } from '@/hooks/use-properties';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useProperties();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.welcome', { name: user?.name })}</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {t('dashboard.overview')}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalProperties')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : properties?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">{t('dashboard.yourProperties')}</h2>
        <Button asChild size="sm">
          <Link to="/properties">
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.manage')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : properties?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('dashboard.noProperties')}</p>
            <Button asChild>
              <Link to="/properties">{t('dashboard.addFirst')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{property.address || t('properties.noAddress')}</p>
                  {property.type && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-secondary rounded-md">
                      {t(`properties.types.${property.type}`)}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
