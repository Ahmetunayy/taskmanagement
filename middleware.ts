import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    try {
        // ✅ Supabase client oluştur
        const supabase = createMiddlewareClient({ req, res });

        // ✅ Kullanıcı oturumunu al (HATAYI ÖNLEMEK İÇİN TRY-CATCH KULLANIYORUZ)
        let session = null;
        try {
            const { data } = await supabase.auth.getSession();
            session = data.session;
        } catch (sessionError) {
            console.warn('Session Error:', sessionError);
        }

        // 🔹 Public ve Protected Sayfalar
        const publicPaths = ['/login', '/signup', '/forgot-password'];
        const protectedPaths = ['/dashboard', '/settings', '/profile', '/createcompany', '/company', '/progress'];

        const currentPath = req.nextUrl.pathname;
        const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));
        const isPublicRoute = publicPaths.some(path => currentPath.startsWith(path));

        // ✅ Ana sayfaya giriş yönlendirmesi
        if (currentPath === '/') {
            return session
                ? NextResponse.redirect(new URL('/dashboard', req.url))
                : NextResponse.redirect(new URL('/login', req.url));
        }

        // 🔹 Kullanıcı login ise ve public sayfaya girmeye çalışıyorsa, dashboard'a yönlendir
        if (session && isPublicRoute) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // 🔹 Kullanıcı login değilse ve korunan bir sayfaya girmeye çalışıyorsa, login'e yönlendir
        if (!session && isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // 🔹 Şirket yönetimi için kullanıcı yetkisini kontrol et
        if (currentPath.startsWith('/company')) {
            if (!session?.user?.id) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }

            const { data: userCompanyRoles } = await supabase
                .from('company_employees')
                .select('role')
                .eq('user_id', session.user.id)
                .single();

            if (!userCompanyRoles || (userCompanyRoles.role !== 'admin' && userCompanyRoles.role !== 'editor')) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
        }

        // ✅ **Sadece oturum varsa, session güncellemesini yap**
        if (session) {
            await supabase.auth.refreshSession(); // ✅ Tokenleri düzgün sıfırlar
            supabase.auth.setSession(session);    // ✅ Çerezleri düzgün formatta yazar
        }

        return res;
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res;
    }
}

// ✅ Matcher Tanımları (Sadece Belirli Sayfalarda Çalıştır)
export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/dashboard/:path*',
        '/settings',
        '/profile',
        '/createcompany',
        '/company/:path*',
        '/progress',
        '/unauthorized'
    ],
    runtime: "nodejs",  // ✅ Edge yerine Node.js kullanarak hatayı önler
};
