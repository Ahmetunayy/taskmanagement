export default function SvgAddButton({ color }: { color: string }) {
    return (
        <svg
                        width="22"
                        height="22"
                        viewBox="0 0 16 16"
                        fill={color}
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-300 origin-center group-hover:rotate-180"
                    >
                        <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
    );
}