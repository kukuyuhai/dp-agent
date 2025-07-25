
export default function BaseContainerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div >
            {children}
        </div>
    )
}