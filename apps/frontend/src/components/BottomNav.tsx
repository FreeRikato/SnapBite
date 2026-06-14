import { BarChart3, Home, Plus, Settings } from "lucide-react";

type BottomNavProps = {
	onTakePhoto: () => void;
};

type Tab = {
	key: string;
	label: string;
	Icon: typeof Home;
	active: boolean;
};

const TABS: Tab[] = [
	{ key: "home", label: "Home", Icon: Home, active: true },
	{ key: "analytics", label: "Analytics", Icon: BarChart3, active: false },
	{ key: "settings", label: "Settings", Icon: Settings, active: false },
];

export function BottomNav({ onTakePhoto }: BottomNavProps) {
	return (
		<nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-neutral-950/80 px-4 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/65">
			<div className="relative mx-auto h-14 max-w-md">
				<div className="grid h-full w-[72%] grid-cols-3 items-center">
					{TABS.map(({ key, label, Icon, active }) => (
						<button
							key={key}
							type="button"
							aria-label={label}
							aria-current={active ? "page" : undefined}
							className="flex min-w-0 flex-col items-center gap-1 text-[11px] font-medium"
						>
							<Icon
								size={24}
								strokeWidth={active ? 2.7 : 2.2}
								className={active ? "text-white" : "text-neutral-500"}
							/>
							<span className={active ? "text-white" : "text-neutral-500"}>
								{label}
							</span>
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={onTakePhoto}
					aria-label="Take a photo"
					className="absolute top-[-2.25rem] right-0 flex size-[4.5rem] items-center justify-center rounded-full bg-white text-neutral-950 shadow-2xl shadow-black/50 ring-1 ring-white/20 transition active:scale-95"
				>
					<Plus size={40} strokeWidth={2.2} />
				</button>
			</div>
		</nav>
	);
}
