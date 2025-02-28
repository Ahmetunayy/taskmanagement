import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Temel oturum kontrolü
    if (request.nextUrl.pathname.includes('/dashboard') ||
        request.nextUrl.pathname.includes('/company') ||
        request.nextUrl.pathname.includes('/progress')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Şirket yönetimi için rol kontrolü
    if (request.nextUrl.pathname.includes('/company')) {
        console.log('Session User ID:', session?.user?.id);

        // Kullanıcının şirket yönetimi izinlerini kontrol et
        const { data: userCompanyRoles, error: roleError } = await supabase
            .from('company_employees')
            .select('role')
            .eq('user_id', session?.user?.id)  // Burayı auth_id'den user_id'ye değiştirdik
            .single();

        console.log('Şirket rolü:', userCompanyRoles?.role, 'Hata:', roleError);

        // Geçici olarak middleware kontrolünü atla - TESTİNİZ BİTİNCE KALDIRIN
        if (process.env.NODE_ENV === 'development') {
            console.log('Geliştirme modunda bypass ediliyor');
        } else if (!userCompanyRoles || (userCompanyRoles.role !== 'admin' && userCompanyRoles.role !== 'editor')) {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
    }

    if (request.nextUrl.pathname === '/login') {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

// ✅ Apply middleware to ALL authentication-protected routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/:auth/dashboard',  // [auth] parametreli rota için
        '/:auth/progress',
        '/:auth/company/:path*',
        '/unauthorized',
        '/createcompany'  // Yeni eklenen sayfa
    ]
};
