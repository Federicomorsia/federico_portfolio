"use client";

import { FC, useState } from "react";
import { Content, LinkField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { asText } from "@prismicio/client";
import Projectslist from "@/slices/Projectslist";

type ViewMode = 'list' | 'grid';

interface ProjectsListWrapperProps {
  projects: Content.ProjectslistSlice[];
}

const ProjectsListWrapper: FC<ProjectsListWrapperProps> = ({ projects }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Extract project title from ProjectsList rich text
  const getProjectTitle = (project: Content.ProjectslistSlice): string => {
    if (project.primary.ProjectsList && Array.isArray(project.primary.ProjectsList)) {
      return asText(project.primary.ProjectsList) || 'Progetto';
    }
    return 'Progetto';
  };

  // Extract link from ProjectsList rich text
  const getProjectLink = (project: Content.ProjectslistSlice): LinkField | null => {
    if (project.primary.ProjectsList && Array.isArray(project.primary.ProjectsList)) {
      // Search for hyperlink in the rich text structure
      for (const element of project.primary.ProjectsList) {
        const elem = element as { spans?: unknown[]; type?: string; data?: unknown };
        if (elem.spans && Array.isArray(elem.spans)) {
          for (const span of elem.spans) {
            const spanData = span as { type?: string; data?: LinkField };
            if (spanData.type === 'hyperlink' && spanData.data) {
              return spanData.data;
            }
          }
        }
        // Also check if there's a direct link in the element
        if (elem.type === 'hyperlink' && elem.data) {
          return elem.data as LinkField;
        }
      }
    }
    return null;
  };

  // If no projects, return null
  if (!projects || projects.length === 0) {
    console.log('ProjectsListWrapper: No projects found');
    return null;
  }

  console.log('ProjectsListWrapper: Rendering with', projects.length, 'projects');

  return (
    <>
      {/* Toggle buttons - styled like list items */}
      <div className="fixed z-[9999] mb-4 md:mb-8" style={{ mixBlendMode: 'difference' }}>
        <div className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl">
          <button
            onClick={() => {
              console.log('Switching to list view');
              setViewMode('list');
            }}
            className={`underline underline-offset-2 transition-colors ${
              viewMode === 'list' ? 'text-accent' : 'text-primary hover:text-accent'
            }`}
          >
            list
          </button>
          <span className="text-primary">/</span>
          <button
            onClick={() => {
              console.log('Switching to grid view');
              setViewMode('grid');
            }}
            className={`underline underline-offset-2 transition-colors ${
              viewMode === 'grid' ? 'text-accent' : 'text-primary hover:text-accent'
            }`}
          >
            grid
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' ? (
        <section className="relative w-screen -ml-[calc((100vw-100%)/2)] pt-24 md:pt-32 pb-16 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-x-12 gap-y-12 items-end">
            {projects.map((project, index) => {
              if (!project.primary.imgpreview?.url) return null;
              
              const link = getProjectLink(project);
              const title = getProjectTitle(project);
              
              const imageContent = (
                <div className="flex flex-col">
                  <div className="relative w-full flex items-end">
                    <PrismicNextImage
                      field={project.primary.imgpreview}
                      className="w-full h-auto object-contain max-h-64 transition-all hover:mix-blend-difference hover:invert"
                    />
                  </div>
                  <p className="text-sm text-primary hover:text-accent mt-2">
                    {title}
                  </p>
                </div>
              );
              
              return (
                <div
                  key={index}
                  className="isolation-auto"
                >
                  {link ? (
                    <PrismicNextLink field={link} className="block cursor-pointer">
                      {imageContent}
                    </PrismicNextLink>
                  ) : (
                    imageContent
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* List view */
        <div className="pt-24 md:pt-32 pb-16">
          {projects.map((project, index) => (
            <Projectslist key={index} slice={project} index={index} slices={projects} context={{}} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectsListWrapper;
