import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function RootLayout() {
  // const { session, loading, fetchSession } = useUserSessionStore();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   fetchSession();
  //   // eslint-disable-next-line
  // }, []);

  // useEffect(() => {
  //   if (!loading && !session) {
  //     navigate("/sign-in");
  //   }
  // }, [loading, session, navigate]);

  return (
    <>
      <SidebarLayout />
    </>
  );
}
