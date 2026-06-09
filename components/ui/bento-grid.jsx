import { cn } from "@/lib/utils";

export const BentoGrid = ({ children, className }) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3 max-w-7xl mx-auto",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}) => {
    return (
        <div
            className={cn(
                `
        group/bento
        relative
        overflow-hidden

        rounded-2xl
        p-5

        bg-neutral-900/40
        border border-neutral-800/50

        backdrop-blur-xl

        flex flex-col
        justify-between
        h-full

        transition-all
        duration-500
        ease-out

        hover:-translate-y-2
        hover:scale-[1.02]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
        hover:border-primary/40
        `,
                className,
            )}
        >
            {/* Glow */}
            <div
                className="
        absolute inset-0
        bg-gradient-to-br
        from-primary/10
        via-transparent
        to-transparent
        opacity-0
        group-hover/bento:opacity-100
        transition-opacity
        duration-500
      "
            />

            {/* Shine Effect */}
            <div
                className="
        absolute
        -left-20
        top-0
        h-full
        w-20
        rotate-12
        bg-white/5
        blur-xl
        transition-all
        duration-700
        group-hover/bento:left-[120%]
      "
            />

            {/* Header */}
            <div
                className="
        relative z-10
        overflow-hidden
        rounded-xl
        group-hover/bento:scale-[1.03]
        transition-transform
        duration-500
      "
            >
                {header}
            </div>

            {/* Content */}
            <div
                className="
        relative z-10
        flex flex-col
        flex-1
        mt-4
        transition-all
        duration-300
        group-hover/bento:translate-x-1
      "
            >
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className="
            p-2
            rounded-xl

            bg-neutral-800/30
            border border-neutral-700/30

            group-hover/bento:bg-primary/10
            group-hover/bento:border-primary/30

            transition-all
            duration-300

            shrink-0
          "
                    >
                        {icon}
                    </div>

                    <h3
                        className="
            font-bold
            text-neutral-200
            text-sm
            md:text-base
            leading-tight

            group-hover/bento:text-primary
            transition-colors
          "
                    >
                        {title}
                    </h3>
                </div>

                <p
                    className="
          text-neutral-400
          text-xs
          md:text-sm
          leading-relaxed

          line-clamp-3

          group-hover/bento:text-neutral-300
          transition-colors
        "
                >
                    {description}
                </p>
            </div>
        </div>
    );
};
