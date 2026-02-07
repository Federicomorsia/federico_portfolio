import { FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { HeaderSlice } from "../../prismicio-types";
import { EmojiText } from "./EmojiText";

const Header: FC = async () => {
  const client = createClient();
  
  try {
    const home = await client.getByUID("page", "home");
    const headerSlice = home.data.slices.find(
      (slice) => slice.slice_type === 'header'
    ) as HeaderSlice | undefined;
    
    if (!headerSlice) {
      return null;
    }

    return (
      <header style={{ mixBlendMode: 'difference' }}>
        <PrismicRichText
          field={headerSlice.primary.RichText}
          components={{
            heading1: ({ children }) => (
              <EmojiText
                className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-primary !leading-normal font-mono"
              >
                {children}
              </EmojiText>
            ),
            hyperlink: ({ node, children }) => (
              <PrismicNextLink 
                field={node.data}
                className="underline underline-offset-2 text-primary hover:text-accent"
              >
                {children}
              </PrismicNextLink>
            )
          }}
        />
      </header>
    );
  } catch (error) {
    console.error('Error loading header:', error);
    return null;
  }
};

export default Header